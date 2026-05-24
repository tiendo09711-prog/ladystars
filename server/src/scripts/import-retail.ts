import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDatabase } from '../config/database.js';
import { RetailInvoice } from '../modules/product/product.models.js';

function parseCsvFile<T>(filePath: string, mapper: (data: any, index: number) => T | null, separator = ';'): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Bỏ qua và không tìm thấy file: ${filePath}`);
            return resolve([]);
        }
        let index = 0;
        fs.createReadStream(filePath)
            .pipe(csv({ separator }))
            .on('data', (data) => {
                index++;
                const cleanData: any = {};
                for (const key of Object.keys(data)) {
                    cleanData[key.trim()] = data[key];
                }
                const mapped = mapper(cleanData, index);
                if (mapped) {
                    results.push(mapped);
                }
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

const importData = async () => {
    try {
        await connectDatabase();
        console.log('✅ Đã kết nối cơ sở dữ liệu MongoDB Atlas.');

        console.log('⚠️ Đang xóa trắng bảng RetailInvoice để chuẩn bị nạp dữ liệu mới...');
        await RetailInvoice.deleteMany({});
        console.log('✅ Xóa bảng RetailInvoice thành công.');

        const basePath = path.resolve('..', 'Bảng dữ liệu');
        const invoicesPath = path.join(basePath, 'Tất cả.csv');
        const paymentsPath = path.join(basePath, 'Xác nhận thanh toán.csv');

        console.log(`\n📦 Đang đọc dữ liệu hóa đơn bán lẻ từ: ${invoicesPath}`);
        const invoices = await parseCsvFile(invoicesPath, (data, index) => {
            if (!data['Ngày']) return null; // Dòng trống

            // Xác định phương thức thanh toán
            let paymentMethod = 'Tiền mặt';
            const tienMat = parseInt(data['Tiền mặt'] || '0');
            const chuyenKhoan = parseInt(data['Chuyển khoản'] || '0');
            const quetThe = parseInt(data['Quẹt thẻ'] || '0');
            if (chuyenKhoan > 0 && tienMat === 0 && quetThe === 0) paymentMethod = 'Chuyển khoản';
            else if (quetThe > 0 && tienMat === 0 && chuyenKhoan === 0) paymentMethod = 'Quẹt thẻ';
            else if (tienMat === 0 && chuyenKhoan === 0 && quetThe === 0) paymentMethod = 'Chuyển khoản'; // Nợ/Khác

            return {
                tabs: ['all'],
                id: data['ID'],
                date: data['Ngày'],
                orderId: data['ID đơn hàng'],
                type: data['Kiểu'],
                salesperson: data['NV Bán hàng'] || data['NV thu ngân'],
                techStaff: data['Nhân viên kỹ thuật'],
                phone: data['SĐT Khách hàng'],
                customerName: data['Tên khách hàng'],
                email: data['Email khách hàng'],
                facebook: '',
                dob: data['Ngày sinh khách hàng'],
                addressLocation: [data['Tỉnh / Thành phố khách hàng'], data['Quận/Huyện khách hàng'], data['Phường/Xã khách hàng']].filter(Boolean).join(', '),
                address: data['Địa chỉ khách hàng'],
                customerLevel: data['Cấp độ khách hàng'],
                orderSource: data['Nguồn khách hàng'],
                productCode: data['Mã sản phẩm'],
                productName: data['Tên sản phẩm'],
                discount: parseInt(data['Chiết khấu'] || '0'),
                vat: parseInt(data['% VAT'] || '0'),
                coupon: data['Mã giảm giá'],
                paymentMethod: paymentMethod,
                totalAmount: parseInt(data['Tổng tiền'] || '0'),
                note: data['Mô tả'] || data['Ghi chú sản phẩm'],
                status: 'Đã thanh toán',
            };
        }, ';');

        console.log(`\n📦 Đang đọc dữ liệu xác nhận thanh toán từ: ${paymentsPath}`);
        const payments = await parseCsvFile(paymentsPath, (data, index) => {
            if (!data['ID đơn hàng']) return null; // Dòng trống
            
            return {
                tabs: ['confirm'],
                orderId: data['ID đơn hàng'],
                senderName: data['Khách chuyển khoản'],
                transactionCode: data['Mã giao dịch'],
                bankName: data['Ngân hàng'],
                bankAccountNo: data['Số tài khoản'],
                transactionDate: data['Ngày giao dịch'],
                store: data['Cửa hàng'],
                transactionContent: data['Nội dung giao dịch'],
                confirmedBy: data['Người xác nhận'],
            };
        }, ';');

        console.log(`\n⏳ Bắt đầu nạp dữ liệu vào MongoDB...`);
        let totalImported = 0;

        if (invoices.length > 0) {
            await RetailInvoice.insertMany(invoices);
            console.log(`✅ Nạp thành công ${invoices.length} hóa đơn bán lẻ (Tất cả).`);
            totalImported += invoices.length;
        }

        if (payments.length > 0) {
            await RetailInvoice.insertMany(payments);
            console.log(`✅ Nạp thành công ${payments.length} xác nhận thanh toán.`);
            totalImported += payments.length;
        }

        console.log(`\n🎉 Hoàn thành! Đã up tổng cộng ${totalImported} dòng dữ liệu.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi import:', error);
        process.exit(1);
    }
};

importData();
