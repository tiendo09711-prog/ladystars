import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDatabase } from '../config/database.js';
import { Product, ProductBranchStock } from '../modules/product/product.models.js';
import { Branch } from '../core/org/branch.model.js';

function parseCsvFile<T>(filePath: string, mapper: (data: any) => T | null, separator = ';'): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        if (!fs.existsSync(filePath)) {
            return resolve([]);
        }
        fs.createReadStream(filePath)
            .pipe(csv({ separator }))
            .on('data', (data) => {
                const cleanData: any = {};
                for (const key of Object.keys(data)) {
                    const cleanKey = key.replace(/^\uFEFF/, '').trim();
                    cleanData[cleanKey] = data[key];
                }
                const mapped = mapper(cleanData);
                if (mapped) results.push(mapped);
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

async function runCustomMigration() {
    try {
        console.log('🔄 Đang kết nối tới Database Atlas...');
        await connectDatabase();
        console.log('✅ Đã kết nối DB.');

        // 1. Load Products
        const productsPath = path.join(process.cwd(), 'Bảng dữ liệu', 'Sản phẩm.csv');
        if (fs.existsSync(productsPath)) {
            console.log('🧹 Xoá dữ liệu cũ của bảng Product...');
            await Product.deleteMany({});
            console.log('✅ Đã dọn sạch collection products.');

            console.log(`⏳ Đang đọc file Products CSV từ: ${productsPath}`);
            const products = await parseCsvFile(productsPath, (data) => {
                const code = data['Mã sản phẩm']?.trim();
                if (!code) return null;

                let productType = 'product';
                const rawType = data['Loại sản phẩm'] || '';
                if (rawType.toLowerCase().includes('dịch vụ')) {
                    productType = 'service';
                } else if (rawType.toLowerCase().includes('combo')) {
                    productType = 'combo';
                }

                return {
                    code: code,
                    name: data['Tên sản phẩm'] || 'Sản phẩm không tên',
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
                    type: productType,
                };
            });

            console.log(`📦 Đang lưu ${products.length} sản phẩm vào Database...`);
            if (products.length > 0) {
                await Product.insertMany(products);
            }
            console.log(`🎉 HOÀN TẤT: Đã insert thành công ${products.length} sản phẩm.`);
        } else {
            console.error(`❌ Không tìm thấy file: ${productsPath}`);
        }

        // 2. Load Inventory (ProductBranchStock)
        const inventoryPath = path.join(process.cwd(), 'Bảng dữ liệu', 'Sản phẩm tồn kho.csv');
        if (fs.existsSync(inventoryPath)) {
            console.log('🧹 Xoá dữ liệu cũ của bảng ProductBranchStock...');
            await ProductBranchStock.deleteMany({});
            console.log('✅ Đã dọn sạch collection productbranchstocks.');

            const branchHN = await Branch.findOne({ code: 'HN' }).lean();
            const branchHCM = await Branch.findOne({ code: 'HCM' }).lean();

            if (!branchHN || !branchHCM) {
                console.warn('⚠️ Cảnh báo: Không tìm thấy chi nhánh HN hoặc HCM trong Database. Bỏ qua ghi nhận tồn kho chi tiết.');
            } else {
                console.log(`⏳ Đang đọc file Tồn kho CSV từ: ${inventoryPath}`);
                
                const stocksToInsert: any[] = [];
                const inventoryRows = await parseCsvFile(inventoryPath, (data) => {
                    const code = data['Mã sản phẩm']?.trim();
                    if (!code) return null;
                    return {
                        code,
                        hnQty: parseInt(data['Kho Hà Nội'], 10) || 0,
                        hcmQty: parseInt(data['Kho HCM'], 10) || 0
                    };
                });

                console.log(`🔍 Mapping tồn kho chi nhánh với sản phẩm...`);
                // Get map of Product ID by code
                const allProducts = await Product.find({}, { _id: 1, code: 1 }).lean();
                const productMap = new Map<string, any>();
                for (const p of allProducts) {
                    productMap.set(p.code, p._id);
                }

                for (const row of inventoryRows) {
                    const productId = productMap.get(row.code);
                    if (!productId) continue;

                    if (row.hnQty > 0 || row.hnQty === 0) {
                        stocksToInsert.push({
                            productId,
                            branchId: branchHN._id,
                            qty: row.hnQty
                        });
                    }
                    if (row.hcmQty > 0 || row.hcmQty === 0) {
                        stocksToInsert.push({
                            productId,
                            branchId: branchHCM._id,
                            qty: row.hcmQty
                        });
                    }
                }

                console.log(`📦 Đang lưu ${stocksToInsert.length} bản ghi tồn kho vào Database...`);
                if (stocksToInsert.length > 0) {
                    await ProductBranchStock.insertMany(stocksToInsert);
                }
                console.log(`🎉 HOÀN TẤT: Đã insert tồn kho thành công.`);
            }
        } else {
            console.error(`❌ Không tìm thấy file: ${inventoryPath}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH IMPORT:', error);
        process.exit(1);
    }
}

runCustomMigration();
