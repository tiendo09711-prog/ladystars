import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDatabase } from '../config/database.js';
import { Product, RetailInvoice, WholesaleInvoice, RefundInvoice } from '../modules/product/product.models.js';
import { InventoryVoucher, InventoryProduct, WarehouseTransfer } from '../modules/warehouse/warehouse.models.js';

function parseCsvFile<T>(filePath: string, mapper: (data: any) => T | null, separator = ';'): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        if (!fs.existsSync(filePath)) {
            return resolve([]);
        }
        fs.createReadStream(filePath)
            .pipe(csv({ separator }))
            .on('data', (data) => {
                // Strip BOM from keys
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

async function runMigration() {
    try {
        console.log('🔄 Đang kết nối tới Database...');
        await connectDatabase();
        console.log('✅ Đã kết nối DB.');

        // 1. Load Products
        const productsPath = path.resolve(process.cwd(), '../Bảng dữ liệu/Products.csv');
        if (fs.existsSync(productsPath)) {
            console.log('🧹 Xoá dữ liệu cũ của bảng Product (Hard Reset)...');
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
                    type: productType,
                    cost: parseInt(data['Giá nhập'], 10) || 0,
                    price: parseInt(data['Giá bán'], 10) || 0,
                    qty: parseInt(data['Tổng tồn'], 10) || 0,
                };
            });

            console.log(`📦 Đang lưu ${products.length} sản phẩm vào Database...`);
            if (products.length > 0) {
                await Product.insertMany(products);
            }
            console.log(`🎉 HOÀN TẤT: Đã insert thành công ${products.length} sản phẩm.`);
        } else {
            console.warn(`⚠️ Bỏ qua nạp Products do không tìm thấy file: ${productsPath}`);
        }

        // 2. Load Phiếu xuất nhập kho
        const vouchersPath = path.resolve(process.cwd(), '../Bảng dữ liệu/Phiếu xuất nhập kho.csv');
        if (fs.existsSync(vouchersPath)) {
            console.log('🧹 Xoá dữ liệu cũ của bảng InventoryVoucher...');
            await InventoryVoucher.deleteMany({});
            console.log('✅ Đã dọn sạch collection inventoryvouchers.');

            console.log(`⏳ Đang đọc file Phiếu xuất nhập kho CSV từ: ${vouchersPath}`);
            const vouchers = await parseCsvFile(vouchersPath, (data) => {
                const voucherId = data['ID']?.trim();
                if (!voucherId) return null;
                return {
                    date: data['Ngày'] || '',
                    voucherId: voucherId,
                    orderId: data['ID đơn hàng'] || '',
                    warehouse: data['Kho hàng'] || '',
                    relatedVoucher: data['Phiếu liên quan'] || '',
                    requestVoucher: data['Phiếu yêu cầu XNK'] || '',
                    warrantyId: data['ID phiếu bảo hành'] || '',
                    warehouseCode: data['Mã kho'] || '',
                    type: data['Kiểu'] || '',
                    supplier: data['Nhà cung cấp'] || '',
                    spCount: parseInt(data['SP'], 10) || 0,
                    qty: parseInt(data['SL'], 10) || 0,
                    totalAmount: parseInt(data['Tổng tiền'], 10) || 0,
                    discount: parseInt(data['Chiết khấu'], 10) || 0,
                    creator: data['Người tạo'] || '',
                    customerDob: data['Ngày sinh khách hàng'] || '',
                    customerPhone: data['SĐT Khách hàng'] || '',
                    note: data['Ghi chú'] || '',
                    invoice: data['Hóa đơn'] || '',
                    createdAtStr: data['Ngày tạo'] || '',
                    seller: data['Nhân viên bán hàng'] || '',
                    code: data['Mã'] || '',
                    invoiceLabel: data['Nhãn hóa đơn XNK'] || '',
                };
            });

            console.log(`📦 Đang lưu ${vouchers.length} phiếu xuất nhập kho vào Database...`);
            if (vouchers.length > 0) {
                await InventoryVoucher.insertMany(vouchers);
            }
            console.log(`🎉 HOÀN TẤT: Đã insert thành công ${vouchers.length} phiếu xuất nhập kho.`);
        } else {
            console.warn(`⚠️ Bỏ qua nạp Phiếu xuất nhập kho do không tìm thấy file: ${vouchersPath}`);
        }

        // 3. Load Sản phẩm xuất nhập kho
        const invProductsPath = path.resolve(process.cwd(), '../Bảng dữ liệu/Sản phẩm xuất nhập kho.csv');
        if (fs.existsSync(invProductsPath)) {
            console.log('🧹 Xoá dữ liệu cũ của bảng InventoryProduct...');
            await InventoryProduct.deleteMany({});
            console.log('✅ Đã dọn sạch collection inventoryproducts.');

            console.log(`⏳ Đang đọc file Sản phẩm xuất nhập kho CSV từ: ${invProductsPath}`);
            const invProducts = await parseCsvFile(invProductsPath, (data) => {
                const id = data['ID']?.trim();
                if (!id) return null;
                return {
                    id: id,
                    voucherId: data['ID phiếu XNK'] || '',
                    warrantyId: data['ID phiếu bảo hành'] || '',
                    warehouse: data['Kho hàng'] || '',
                    date: data['Ngày'] || '',
                    productCode: data['Mã sản phẩm'] || '',
                    productName: data['Sản phẩm'] || '',
                    barcode: data['Mã vạch'] || '',
                    imei: data['IMEI'] || '',
                    batch: data['Lô hàng'] || '',
                    supplier: data['Nhà cung cấp'] || '',
                    type: data['Kiểu'] || '',
                    category: data['Danh mục'] || '',
                    importQty: parseInt(data['Số lượng nhập'], 10) || 0,
                    exportQty: parseInt(data['Số lượng xuất'], 10) || 0,
                    minUnitQty: parseInt(data['SL quy đổi theo đơn vị nhỏ nhất'], 10) || 0,
                    price: parseInt(data['Giá'], 10) || 0,
                    vat: parseInt(data['VAT'], 10) || 0,
                    vatType: data['Loại vat'] || '',
                    cost: parseInt(data['Giá vốn'], 10) || 0,
                    amount: parseInt(data['Tiền'], 10) || 0,
                    discount: parseInt(data['Chiết khấu'], 10) || 0,
                    totalAmount: parseInt(data['Tổng tiền'], 10) || 0,
                    extendedWarranty: data['Bảo hành mở rộng'] || '',
                    description: data['Mô tả'] || '',
                    createdAtStr: data['Ngày tạo'] || '',
                    unit: data['Đơn vị tính'] || '',
                    currentPrice: parseInt(data['Giá bán hiện tại'], 10) || 0,
                    totalPriceAmount: parseInt(data['Tổng tiền giá bán'], 10) || 0,
                    seller: data['Nhân viên bán hàng'] || '',
                    creator: data['Người tạo'] || '',
                    customer: data['Khách hàng'] || '',
                };
            });

            console.log(`📦 Đang lưu ${invProducts.length} sản phẩm xuất nhập kho vào Database...`);
            if (invProducts.length > 0) {
                await InventoryProduct.insertMany(invProducts);
            }
            console.log(`🎉 HOÀN TẤT: Đã insert thành công ${invProducts.length} sản phẩm xuất nhập kho.`);
        } else {
            console.warn(`⚠️ Bỏ qua nạp Sản phẩm xuất nhập kho do không tìm thấy file: ${invProductsPath}`);
        }

        // 4. Load Chuyển kho (Warehouse Transfer)
        console.log('🧹 Xoá dữ liệu cũ của bảng WarehouseTransfer...');
        await WarehouseTransfer.deleteMany({});
        console.log('✅ Đã dọn sạch collection warehousetransfers.');

        const transferFiles = [
            { name: 'Chuyển Kho - Tất Cả.csv', tab: 'all', isAllCsv: true },
            { name: 'Chuyển kho - Phiếu nháp.csv', tab: 'draft', isAllCsv: false },
            { name: 'Chuyển kho - Đang chuyển đi.csv', tab: 'transferring', isAllCsv: false },
            { name: 'Chuyển kho - Sắp chuyển đến.csv', tab: 'incoming', isAllCsv: false }
        ];

        for (const fileInfo of transferFiles) {
            const filePath = path.resolve(process.cwd(), `../Bảng dữ liệu/${fileInfo.name}`);
            if (fs.existsSync(filePath)) {
                console.log(`⏳ Đang đọc file CSV: ${fileInfo.name}`);
                
                const rows = await parseCsvFile(filePath, (data) => {
                    const id = data['ID']?.trim();
                    if (!id) return null;

                    if (fileInfo.isAllCsv) {
                        return {
                            id,
                            date: data['Ngày'] || '',
                            type: data['Kiểu'] || '',
                            warehouse: data['Kho hàng'] || data['Mã kho'] || '',
                            spCount: parseInt(data['Số SP'], 10) || 0,
                            qty: parseInt(data['Tổng SL'], 10) || 0,
                            totalAmount: parseInt(data['Tổng tiền theo giá bán'] || data['Tổng tiền'], 10) || 0,
                            creator: data['Người lập phiếu'] || '',
                            note: data['Ghi chú'] || '',
                        };
                    } else {
                        return {
                            id,
                            date: data['Ngày'] || '',
                            type: data['Kiểu'] || '',
                            warehouse: data['Kho'] || '',
                            spCount: parseInt(data['Số lượng SP'], 10) || 0,
                            qty: parseInt(data['Tổng SL'], 10) || 0,
                            totalAmount: 0,
                            creator: data['Người tạo'] || '',
                            note: data['Mô tả'] || '',
                            timeCreated: data['Thời gian lập phiếu'] || '',
                            approvedBy: data['Duyệt'] || '',
                            dateApproved: data['Ngày Duyệt'] || '',
                            confirmedBy: data['Xác nhận'] || '',
                            dateConfirmed: data['Ngày xác nhận'] || '',
                            cancelledBy: data['Người hủy'] || '',
                            timeCancelled: data['Thời gian hủy'] || '',
                        };
                    }
                });

                console.log(`💾 Đang upsert ${rows.length} records từ file ${fileInfo.name}...`);
                for (const row of rows) {
                    const updateObj: any = {
                        $set: {
                            ...row
                        },
                        $addToSet: {
                            tabs: fileInfo.tab
                        }
                    };

                    if (row.totalAmount > 0) {
                        updateObj.$set.totalAmount = row.totalAmount;
                    }

                    delete updateObj.$set.id;

                    await WarehouseTransfer.findOneAndUpdate(
                        { id: row.id },
                        updateObj,
                        { upsert: true, new: true }
                    );
                }
                console.log(`✅ Hoàn tất file ${fileInfo.name}.`);
            } else {
                console.warn(`⚠️ Bỏ qua nạp file do không tìm thấy: ${filePath}`);
            }
        }

        // 5. Load Bán lẻ (Retail Invoices)
        console.log('🧹 Xoá dữ liệu cũ của bảng RetailInvoice...');
        await RetailInvoice.deleteMany({});
        console.log('✅ Đã dọn sạch collection retailinvoices.');

        const retailFiles = [
            { name: 'Bán lẻ - Tất cả.csv', tab: 'all' },
            { name: 'Bán lẻ - Xác nhận thanh toán.csv', tab: 'confirm' }
        ];

        for (const fileInfo of retailFiles) {
            const filePath = path.resolve(process.cwd(), `../Bảng dữ liệu/${fileInfo.name}`);
            if (fs.existsSync(filePath)) {
                console.log(`⏳ Đang đọc file CSV: ${fileInfo.name}`);
                
                const rows = await parseCsvFile(filePath, (data) => {
                    if (fileInfo.tab === 'all') {
                        const id = data['ID']?.trim();
                        if (!id) return null;
                        return {
                            id,
                            date: data['Ngày'] || '',
                            orderId: data['ID đơn hàng'] || '',
                            type: data['Kiểu'] || '',
                            customerName: data['Tên khách hàng'] || '',
                            productCode: data['Mã sản phẩm'] || '',
                            productName: data['Tên sản phẩm'] || '',
                            totalAmount: parseInt(data['Tổng tiền'], 10) || 0,
                            status: data['Trạng thái hóa đơn điện tử'] || 'Mới',
                        };
                    } else {
                        // Confirm tab
                        const orderId = data['ID đơn hàng']?.trim();
                        if (!orderId) return null;
                        return {
                            orderId,
                            senderName: data['Khách chuyển khoản'] || '',
                            transactionCode: data['Mã giao dịch'] || '',
                            bankName: data['Ngân hàng'] || '',
                            bankAccountNo: data['Số tài khoản'] || '',
                            transactionDate: data['Ngày giao dịch'] || '',
                            confirmedBy: data['Người xác nhận'] || '',
                        };
                    }
                });

                console.log(`💾 Đang upsert ${rows.length} records từ file ${fileInfo.name}...`);
                for (const row of rows) {
                    const updateObj: any = {
                        $set: {
                            ...row
                        },
                        $addToSet: {
                            tabs: fileInfo.tab
                        }
                    };

                    if ('totalAmount' in row && row.totalAmount && row.totalAmount > 0) {
                        updateObj.$set.totalAmount = row.totalAmount;
                    }

                    const filterQuery = fileInfo.tab === 'all' ? { id: row.id } : { orderId: row.orderId };
                    
                    if (row.id) {
                        delete updateObj.$set.id;
                    }

                    await RetailInvoice.findOneAndUpdate(
                        filterQuery,
                        updateObj,
                        { upsert: true, new: true }
                    );
                }
                console.log(`✅ Hoàn tất file ${fileInfo.name}.`);
            } else {
                console.warn(`⚠️ Bỏ qua nạp file do không tìm thấy: ${filePath}`);
            }
        }

        // 6. Load Bán sỉ (Wholesale Invoices)
        console.log('🧹 Xoá dữ liệu cũ của bảng WholesaleInvoice...');
        await WholesaleInvoice.deleteMany({});
        console.log('✅ Đã dọn sạch collection wholesaleinvoices.');

        const wholesaleFiles = [
            { name: 'Hóa đơn bán sỉ.csv', tab: 'wholesale' },
            { name: 'Có chiết khấu.csv', tab: 'discount' },
            { name: 'Có công nợ.csv', tab: 'debt' }
        ];

        let totalWholesaleRecordsLoaded = 0;

        for (const fileInfo of wholesaleFiles) {
            const filePath = path.resolve(process.cwd(), `../Bảng dữ liệu/${fileInfo.name}`);
            if (fs.existsSync(filePath)) {
                console.log(`⏳ Đang đọc file CSV bán sỉ: ${fileInfo.name}`);
                
                const rows = await parseCsvFile(filePath, (data) => {
                    const id = data['ID']?.trim();
                    if (!id) return null;
                    return {
                        id,
                        date: data['Ngày'] || '',
                        cashier: data['Nhân viên thu ngân'] || '',
                        salesperson: data['Nhân viên bán hàng'] || '',
                        type: data['Kiểu'] || '',
                        warehouse: data['Kho'] || '',
                        customerName: data['Tên khách hàng'] || '',
                        customerCode: data['Mã khách hàng'] || '',
                        customerPhone: data['Số điện thoại khách hàng'] || '',
                        otherInfo: data['Thông tin khác'] || '',
                        productName: data['Tên sản phẩm'] || '',
                        gift: data['Quà tặng'] || '',
                        productCode: data['Mã sản phẩm'] || '',
                        barcode: data['Mã vạch'] || '',
                        price: parseInt(data['Giá bán'], 10) || 0,
                        unit: data['Đơn vị tính'] || '',
                        imei: data['IMEI'] || '',
                        cost: parseInt(data['Giá vốn'], 10) || 0,
                        quantity: parseInt(data['Số lượng'], 10) || 0,
                        vatAmount: parseInt(data['VAT'], 10) || 0,
                        vatPercent: parseInt(data['% VAT'], 10) || 0,
                        vatType: data['Loại vat'] || '',
                        productNote: data['Ghi chú sản phẩm'] || '',
                        subtotalBeforeDiscount: parseInt(data['Thành tiền (Chưa CK)'], 10) || 0,
                        subtotalAfterDiscount: parseInt(data['Thành tiền (SCK)'], 10) || 0,
                        profit: parseInt(data['Lợi nhuận'], 10) || 0,
                        productDiscount: parseInt(data['Chiết khấu theo sản phẩm'], 10) || 0,
                        productDiscountPercent: parseInt(data['Chiết khấu theo phần trăm'], 10) || 0,
                        totalProducts: parseInt(data['Tổng sản phẩm'], 10) || 0,
                        totalBeforeDiscount: parseInt(data['Tổng tiền (Chưa cK)'], 10) || 0,
                        totalAmount: parseInt(data['Tổng tiền phải TT'], 10) || 0,
                        paidAmount: parseInt(data['Đã TT'], 10) || 0,
                        orderDiscount: parseInt(data['Chiết khấu theo đơn'], 10) || 0,
                        debtAmount: parseInt(data['Chưa TT'], 10) || 0,
                        description: data['Mô tả'] || '',
                        wholesaleInvoiceLabel: data['Nhãn hóa đơn bán sỉ'] || '',
                        status: data['Chưa TT'] && parseInt(data['Chưa TT'], 10) > 0 ? 'Còn nợ' : 'Đã thanh toán',
                    };
                });

                if (rows.length > 0) {
                    console.log(`💾 Đang upsert ${rows.length} records từ file ${fileInfo.name}...`);
                    for (const row of rows) {
                        const updateObj: any = {
                            $set: {
                                ...row
                            },
                            $addToSet: {
                                tabs: fileInfo.tab
                            }
                        };
                        delete updateObj.$set.id;

                        await WholesaleInvoice.findOneAndUpdate(
                            { id: row.id },
                            updateObj,
                            { upsert: true, new: true }
                        );
                        totalWholesaleRecordsLoaded++;
                    }
                    console.log(`✅ Hoàn tất file ${fileInfo.name}.`);
                } else {
                    console.log(`ℹ️ File ${fileInfo.name} chỉ có tiêu đề, không có dữ liệu để nạp.`);
                }
            } else {
                console.warn(`⚠️ Bỏ qua nạp file do không tìm thấy: ${filePath}`);
            }
        }

        // Seeding dữ liệu mẫu nếu không tải được bản ghi nào từ các file CSV
        if (totalWholesaleRecordsLoaded === 0) {
            console.log('🌱 Không tìm thấy dữ liệu trong file CSV. Tiến hành Seeding dữ liệu mẫu bán sỉ...');
            const mockWholesaleInvoices = [
                {
                    id: 'HDSI-10001',
                    tabs: ['wholesale'],
                    date: new Date().toLocaleString('vi-VN'),
                    cashier: 'Lê Sỹ Bách',
                    salesperson: 'Trần Văn Hoàng',
                    type: 'Xuất bán sỉ [S]',
                    warehouse: 'Kho Hà Nội',
                    customerName: 'Đại lý Mỹ phẩm Hoa Mai',
                    customerCode: 'DL-HOAMAI',
                    customerPhone: '0987654321',
                    productName: 'Kem dưỡng da LadyStars Premium',
                    productCode: 'LD-PREMIUM-01',
                    price: 500000,
                    unit: 'Hộp',
                    cost: 300000,
                    quantity: 20,
                    subtotalBeforeDiscount: 10000000,
                    subtotalAfterDiscount: 10000000,
                    totalProducts: 20,
                    totalBeforeDiscount: 10000000,
                    totalAmount: 10000000,
                    paidAmount: 10000000,
                    debtAmount: 0,
                    status: 'Đã thanh toán',
                    wholesaleInvoiceLabel: 'Bán sỉ thường'
                },
                {
                    id: 'HDSI-10002',
                    tabs: ['wholesale', 'discount'],
                    date: new Date().toLocaleString('vi-VN'),
                    cashier: 'Lê Sỹ Bách',
                    salesperson: 'Nguyễn Thị Hương',
                    type: 'Xuất bán sỉ [S]',
                    warehouse: 'Kho HCM',
                    customerName: 'Spa & Beauty Quỳnh Anh',
                    customerCode: 'SPA-QA',
                    customerPhone: '0912345678',
                    productName: 'Serum phục hồi LadyStars Gold',
                    productCode: 'LD-SERUM-G',
                    price: 800000,
                    unit: 'Chai',
                    cost: 450000,
                    quantity: 15,
                    subtotalBeforeDiscount: 12000000,
                    subtotalAfterDiscount: 10800000,
                    productDiscount: 1200000,
                    productDiscountPercent: 10,
                    totalProducts: 15,
                    totalBeforeDiscount: 12000000,
                    totalAmount: 10800000,
                    paidAmount: 10800000,
                    debtAmount: 0,
                    status: 'Đã thanh toán',
                    wholesaleInvoiceLabel: 'Bán sỉ chiết khấu'
                },
                {
                    id: 'HDSI-10003',
                    tabs: ['wholesale', 'debt'],
                    date: new Date().toLocaleString('vi-VN'),
                    cashier: 'Lê Sỹ Bách',
                    salesperson: 'Trần Văn Hoàng',
                    type: 'Xuất bán sỉ [S]',
                    warehouse: 'Kho Hà Nội',
                    customerName: 'Hệ thống Salon tóc Hùng Dũng',
                    customerCode: 'SALON-HD',
                    customerPhone: '0909998887',
                    productName: 'Dầu gội thảo dược LadyStars Organic',
                    productCode: 'LD-SHAMPOO-O',
                    price: 250000,
                    unit: 'Chai',
                    cost: 150000,
                    quantity: 40,
                    subtotalBeforeDiscount: 10000000,
                    subtotalAfterDiscount: 10000000,
                    totalProducts: 40,
                    totalBeforeDiscount: 10000000,
                    totalAmount: 10000000,
                    paidAmount: 4000000,
                    debtAmount: 6000000,
                    status: 'Còn nợ',
                    wholesaleInvoiceLabel: 'Bán sỉ công nợ'
                }
            ];
            await WholesaleInvoice.insertMany(mockWholesaleInvoices);
            console.log('✅ Đã nạp thành công 3 hóa đơn bán sỉ mẫu.');
        }

        // 7. Load Trả hàng (Refund Invoices)
        console.log('🧹 Xoá dữ liệu cũ của bảng RefundInvoice...');
        await RefundInvoice.deleteMany({});
        console.log('✅ Đã dọn sạch collection refundinvoices.');

        const refundPath = path.resolve(process.cwd(), '../Bảng dữ liệu/Nhanh.vn_Product_Retain_Return_2026-05-22_152444.csv');
        if (fs.existsSync(refundPath)) {
            console.log(`⏳ Đang đọc file CSV trả hàng: ${refundPath}`);
            const refundRows = await parseCsvFile(refundPath, (data) => {
                const id = data['ID']?.trim();
                if (!id) return null;
                return {
                    id,
                    date: data['Ngày'] || '',
                    returnOrderId: data['ID đơn trả'] || '',
                    receiver: data['Nhân viên nhận trả hàng'] || '',
                    salesAccount: data['Tài khoản NVBH'] || '',
                    salesperson: data['Nhân viên bán hàng'] || '',
                    cashier: data['Nhân viên thu ngân'] || '',
                    type: data['Kiểu'] || '',
                    warehouse: data['Kho'] || '',
                    customerName: data['Tên khách hàng'] || '',
                    customerPhone: data['SĐT Khách hàng'] || '',
                    email: data['Email'] || '',
                    address: data['Địa chỉ'] || '',
                    gender: data['Giới tính'] || '',
                    parentProductCode: data['Mã sản phẩm cha'] || '',
                    parentProductName: data['Tên sản phẩm cha'] || '',
                    productCode: data['Mã sản phẩm'] || '',
                    productName: data['Tên sản phẩm'] || '',
                    unit: data['Đơn vị tính'] || '',
                    imei: data['IMEI'] || '',
                    batch: data['Lô hàng'] || '',
                    brand: data['Thương hiệu'] || '',
                    price: parseInt(data['Giá bán'], 10) || 0,
                    cost: parseInt(data['Giá vốn'], 10) || 0,
                    quantity: parseInt(data['Số lượng'], 10) || 0,
                    vat: parseInt(data['VAT'], 10) || 0,
                    gift: data['Quà tặng'] || '',
                    giftCost: parseInt(data['Giá vốn quà tặng'], 10) || 0,
                    extendedWarrantyName: data['Tên gói BHMR'] || '',
                    extendedWarrantyFee: parseInt(data['Tiền BHMR'], 10) || 0,
                    revenue: parseInt(data['Doanh thu'], 10) || 0,
                    refundAmount: parseInt(data['Trả lại'], 10) || 0,
                    refundFee: parseInt(data['Phí trả hàng'], 10) || 0,
                    cash: parseInt(data['Tiền mặt'], 10) || 0,
                    transfer: parseInt(data['Chuyển khoản'], 10) || 0,
                    totalAmount: parseInt(data['Tổng tiền'], 10) || 0,
                    discount: parseInt(data['Chiết khấu'], 10) || 0,
                    description: data['Mô tả'] || '',
                    returnFromInvoice: data['Trả hàng từ hóa đơn'] || '',
                    returnFromOrder: data['Trả hàng từ đơn hàng'] || '',
                    profit: parseInt(data['Lợi nhuận'], 10) || 0,
                    accumulatedPoints: parseInt(data['Điểm tích lũy từ hóa đơn'], 10) || 0,
                    salesCommission: parseInt(data['Hoa hồng bán hàng'], 10) || 0,
                };
            });
            if (refundRows.length > 0) {
                console.log(`💾 Đang upsert ${refundRows.length} records trả hàng...`);
                for (const row of refundRows) {
                    const updateObj: any = { $set: row };
                    delete updateObj.$set.id;
                    await RefundInvoice.findOneAndUpdate({ id: row.id }, updateObj, { upsert: true, new: true });
                }
                console.log(`✅ Hoàn tất nạp dữ liệu trả hàng.`);
            }
        } else {
            console.warn(`⚠️ Bỏ qua nạp file do không tìm thấy: ${refundPath}`);
        }

        process.exit(0);


    } catch (error) {
        console.error('❌ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH MIGRATION:', error);
        process.exit(1);
    }
}

runMigration();
