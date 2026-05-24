import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDatabase } from '../config/database.js';
import { Product, Category, Batch, ProductEditLog, ProductBranchStock } from '../modules/product/product.models.js';
import { Vendor } from '../modules/vendor/vendor.models.js';
import { Branch } from '../core/org/branch.model.js';

function parseCsvFile<T>(filePath: string, mapper: (data: any, index: number) => T | null, separator = ';'): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Bỏ qua vì không tìm thấy file: ${filePath}`);
            return resolve([]);
        }
        let index = 0;
        fs.createReadStream(filePath)
            .pipe(csv({ separator }))
            .on('data', (data) => {
                index++;
                const cleanData: any = {};
                for (const key of Object.keys(data)) {
                    const cleanKey = key.replace(/^\uFEFF/, '').trim();
                    cleanData[cleanKey] = data[key];
                }
                const mapped = mapper(cleanData, index);
                if (mapped) results.push(mapped);
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

async function runImport() {
    try {
        console.log('🔄 Đang kết nối tới Database Atlas...');
        await connectDatabase();
        console.log('✅ Đã kết nối DB.');

        const baseDir = path.join(process.cwd(), '..', 'Bảng dữ liệu');

        // 1. DANH MỤC
        console.log('\n🧹 Xoá dữ liệu cũ của bảng Category...');
        await Category.deleteMany({});
        const categoriesPath = path.join(baseDir, 'Danh Mục.csv');
        console.log(`⏳ Đang đọc: ${categoriesPath}`);
        const categories = await parseCsvFile(categoriesPath, (data) => {
            if (!data['Mã danh mục']) return null;
            return {
                name: data['Tên danh mục'],
                code: data['Mã danh mục'],
                isActive: data['Hoạt động'] === 'Hoạt động',
                isVisible: data['Hiển thị'] === 'Hiển thị',
                productCount: parseInt(data['Số sản phẩm'], 10) || 0,
                url: data['Link trên website']
            };
        });
        if (categories.length > 0) await Category.insertMany(categories);
        console.log(`✅ Đã insert ${categories.length} danh mục.`);

        // 2. SẢN PHẨM
        console.log('\n🧹 Xoá dữ liệu cũ của bảng Product...');
        await Product.deleteMany({});
        const productsPath = path.join(baseDir, 'Sản phẩm.csv');
        console.log(`⏳ Đang đọc: ${productsPath}`);
        const products = await parseCsvFile(productsPath, (data) => {
            const code = data['Mã sản phẩm']?.trim();
            if (!code) return null;
            let type = 'product';
            if (data['Loại sản phẩm']?.toLowerCase().includes('dịch vụ')) type = 'service';
            else if (data['Loại sản phẩm']?.toLowerCase().includes('combo')) type = 'combo';
            
            return {
                code,
                name: data['Tên sản phẩm'] || 'Chưa có tên',
                barcode: data['Mã vạch'] || '',
                parentCode: data['Mã sản phẩm cha'] || '',
                parentName: data['Tên sản phẩm cha'] || '',
                categoryName: data['Danh mục'] || '',
                trademarkName: data['Thương hiệu'] || '',
                supplierName: data['Nhà cung cấp'] || '',
                origin: data['Xuất xứ'] || '',
                color: data['Màu sắc'] || '',
                size: data['Kích thước'] || '',
                cost: parseInt(data['Giá nhập'] || data['Giá vốn'], 10) || 0,
                price: parseInt(data['Giá bán'], 10) || 0,
                wholesalePrice: parseInt(data['Giá sỉ'], 10) || 0,
                weight: parseInt(data['Cân nặng cả vỏ hộp'], 10) || 0,
                qty: parseInt(data['Tổng tồn'], 10) || 0,
                unit: data['Đơn vị tính'] || '',
                status: data['Trạng thái'] || 'Mới',
                type,
            };
        });
        if (products.length > 0) await Product.insertMany(products);
        console.log(`✅ Đã insert ${products.length} sản phẩm.`);

        // Lấy danh sách Product Map để gán ID
        const productMap = new Map();
        const allProducts = await Product.find({}, { _id: 1, code: 1 }).lean();
        for (const p of allProducts) productMap.set(p.code, p._id);

        // 3. TỒN KHO CHI NHÁNH
        console.log('\n🧹 Xoá dữ liệu cũ của bảng ProductBranchStock...');
        await ProductBranchStock.deleteMany({});
        const branchHN = await Branch.findOne({ code: 'HN' }).lean();
        const branchHCM = await Branch.findOne({ code: 'HCM' }).lean();
        
        const inventoryPath = path.join(baseDir, 'Tồn kho.csv');
        console.log(`⏳ Đang đọc: ${inventoryPath}`);
        const stocksToInsert: any[] = [];

        const inventoryRows = await parseCsvFile(inventoryPath, (data) => {
            const code = data['Mã sản phẩm']?.trim();
            if (!code) return null;
            return { code, hnQty: parseInt(data['Kho Hà Nội'], 10) || 0, hcmQty: parseInt(data['Kho HCM'], 10) || 0 };
        });

        for (const row of inventoryRows) {
            const productId = productMap.get(row.code);
            if (!productId) continue;
            if (branchHN && (row.hnQty > 0 || row.hnQty === 0)) {
                stocksToInsert.push({ productId, branchId: branchHN._id, qty: row.hnQty });
            }
            if (branchHCM && (row.hcmQty > 0 || row.hcmQty === 0)) {
                stocksToInsert.push({ productId, branchId: branchHCM._id, qty: row.hcmQty });
            }
        }
        if (stocksToInsert.length > 0) await ProductBranchStock.insertMany(stocksToInsert);
        console.log(`✅ Đã insert ${stocksToInsert.length} bản ghi tồn kho chi nhánh.`);

        // 4. LỊCH SỬ SỬA XOÁ
        console.log('\n🧹 Xoá dữ liệu cũ của bảng ProductEditLog...');
        await ProductEditLog.deleteMany({});
        const editLogPath = path.join(baseDir, 'Sản Phẩm - Lịch Sử Sửa Xóa.csv');
        console.log(`⏳ Đang đọc: ${editLogPath}`);
        const editLogs = await parseCsvFile(editLogPath, (data) => {
            if (!data['Mã sản phẩm'] && !data['Tên sản phẩm']) return null;
            return {
                productCode: data['Mã sản phẩm'] || 'UNKNOWN',
                productName: data['Tên sản phẩm'] || 'UNKNOWN',
                logType: data['Loại log'] || 'Sửa sản phẩm',
                logAction: data['Kiểu log'] || 'Sửa thông tin',
                createdBy: data['Người sửa'] || 'System',
                createdAt: data['Thời gian'] ? new Date(data['Thời gian']) : new Date()
            };
        });
        if (editLogs.length > 0) await ProductEditLog.insertMany(editLogs);
        console.log(`✅ Đã insert ${editLogs.length} lịch sử sửa xóa.`);

        // 5. NHÀ CUNG CẤP
        console.log('\n🧹 Xoá dữ liệu cũ của bảng Vendor...');
        await Vendor.deleteMany({});
        const vendorPath = path.join(baseDir, 'Nhà cung cấp.csv');
        console.log(`⏳ Đang đọc: ${vendorPath}`);
        const vendors = await parseCsvFile(vendorPath, (data, index) => {
            const name = data['Tên nhà cung cấp'];
            if (!name) return null;
            const code = data['Mã nhà cung cấp'] || `VND-MIGRATE-${index}`;
            return {
                code,
                name,
                type: data['Loại'] === 'Cá nhân' ? 'person' : 'company',
                phone: data['Điện thoại'],
                email: data['Email'],
                address: data['Địa chỉ'],
                note: data['Ghi chú'],
                status: data['Trạng thái'] === 'Đang giao dịch' ? 'active' : 'inactive'
            };
        });
        if (vendors.length > 0) await Vendor.insertMany(vendors);
        console.log(`✅ Đã insert ${vendors.length} nhà cung cấp.`);

        // 6. LÔ SẢN PHẨM
        console.log('\n🧹 Xoá dữ liệu cũ của bảng Batch...');
        await Batch.deleteMany({});
        const batchPath = path.join(baseDir, 'Lô Sản Phẩm.csv');
        console.log(`⏳ Đang đọc: ${batchPath}`);
        const batches = await parseCsvFile(batchPath, (data) => {
            const batchNumber = data['Số lô'];
            if (!batchNumber) return null;
            return {
                batchNumber,
                productCode: data['Sản phẩm'], 
                manufactureDate: data['Ngày sản xuất'] ? new Date(data['Ngày sản xuất']) : null,
                expiryDate: data['Ngày hết hạn'] ? new Date(data['Ngày hết hạn']) : null,
                qty: parseInt(data['Tồn kho'], 10) || 0
            };
        });
        
        const finalBatches = batches.map(b => {
            const pId = productMap.get(b.productCode);
            if (!pId) return null;
            return {
                batchNumber: b.batchNumber,
                productId: pId,
                qty: b.qty,
                manufactureDate: b.manufactureDate,
                expiryDate: b.expiryDate
            };
        }).filter(b => b !== null);

        if (finalBatches.length > 0) await Batch.insertMany(finalBatches);
        console.log(`✅ Đã insert ${finalBatches.length} lô sản phẩm.`);

        console.log('\n🎉 QUÁ TRÌNH IMPORT DỮ LIỆU HOÀN TẤT.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH IMPORT:', error);
        process.exit(1);
    }
}

runImport();
