import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDatabase } from '../config/database.js';
import { InventoryCheck, InventoryCheckProduct } from '../modules/warehouse/warehouse.models.js';

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

        // 1. Kiểm kho
        console.log('\n🧹 Xoá dữ liệu cũ của bảng InventoryCheck...');
        await InventoryCheck.deleteMany({});
        const checkPath = path.join(baseDir, 'Nhanh.vn_Inventory_Check_Index_2026-05-24_102606.csv');
        console.log(`⏳ Đang đọc: ${checkPath}`);
        const checks = await parseCsvFile(checkPath, (data) => {
            if (!data['ID']) return null;
            return {
                id: data['ID'],
                date: data['Ngày'],
                type: data['Loại kiểm kho'],
                warehouse: data['Kho'],
                creator: data['Người tạo'],
                spCount: parseInt(data['SP'], 10) || 0,
                qty: parseInt(data['SL'], 10) || 0,
                note: data['Ghi chú'] || '',
                missingSp: data['SP thiếu'] || '',
                balance: data['Bù trừ kiểm kho'] || ''
            };
        });
        if (checks.length > 0) await InventoryCheck.insertMany(checks);
        console.log(`✅ Đã insert ${checks.length} phiếu kiểm kho.`);

        // 2. Sản phẩm kiểm kho
        console.log('\n🧹 Xoá dữ liệu cũ của bảng InventoryCheckProduct...');
        await InventoryCheckProduct.deleteMany({});
        const productPath = path.join(baseDir, 'Nhanh.vn_Inventory_Check_Product_2026-05-24_102622.csv');
        console.log(`⏳ Đang đọc: ${productPath}`);
        const products = await parseCsvFile(productPath, (data) => {
            if (!data['Tên sản phẩm']) return null;
            return {
                date: data['Ngày'],
                warehouse: data['Kho'],
                productName: data['Tên sản phẩm'],
                cost: parseInt(data['Giá vốn'], 10) || 0,
                price: parseInt(data['Giá bán'], 10) || 0,
                stock: parseInt(data['Tồn'], 10) || 0,
                transferring: parseInt(data['Đang chuyển'], 10) || 0,
                actualStock: parseInt(data['Tồn thực tế'], 10) || 0,
                difference: parseInt(data['Chênh lệch'], 10) || 0,
                description: data['Mô tả'] || ''
            };
        });
        if (products.length > 0) await InventoryCheckProduct.insertMany(products);
        console.log(`✅ Đã insert ${products.length} sản phẩm kiểm kho.`);

        console.log('\n🎉 QUÁ TRÌNH IMPORT DỮ LIỆU HOÀN TẤT.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH IMPORT:', error);
        process.exit(1);
    }
}

runImport();
