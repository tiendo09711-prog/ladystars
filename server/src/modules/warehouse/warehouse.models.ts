import { Schema, model } from 'mongoose';

const InventoryVoucherSchema = new Schema({
  date: String,             // Ngày
  voucherId: { type: String, required: true, unique: true }, // ID
  orderId: String,          // ID đơn hàng
  warehouse: String,        // Kho hàng
  relatedVoucher: String,   // Phiếu liên quan
  requestVoucher: String,   // Phiếu yêu cầu XNK
  warrantyId: String,       // ID phiếu bảo hành
  warehouseCode: String,    // Mã kho
  type: String,             // Kiểu
  supplier: String,         // Nhà cung cấp
  spCount: { type: Number, default: 0 }, // SP
  qty: { type: Number, default: 0 },      // SL
  totalAmount: { type: Number, default: 0 }, // Tổng tiền
  discount: { type: Number, default: 0 },    // Chiết khấu
  creator: String,          // Người tạo
  customerDob: String,      // Ngày sinh khách hàng
  customerPhone: String,    // SĐT Khách hàng
  note: String,             // Ghi chú
  invoice: String,          // Hóa đơn
  createdAtStr: String,     // Ngày tạo (from CSV)
  seller: String,           // Nhân viên bán hàng
  code: String,             // Mã
  invoiceLabel: String,     // Nhãn hóa đơn XNK
}, { timestamps: true, strict: false });

InventoryVoucherSchema.index({ voucherId: 'text', warehouse: 'text', type: 'text', creator: 'text', customerPhone: 'text' });
export const InventoryVoucher = model('InventoryVoucher', InventoryVoucherSchema);


const InventoryProductSchema = new Schema({
  id: { type: String, required: true, unique: true }, // ID
  voucherId: String,        // ID phiếu XNK
  warrantyId: String,       // ID phiếu bảo hành
  warehouse: String,        // Kho hàng
  date: String,             // Ngày
  productCode: String,      // Mã sản phẩm
  productName: String,      // Sản phẩm
  barcode: String,          // Mã vạch
  imei: String,             // IMEI
  batch: String,            // Lô hàng
  supplier: String,         // Nhà cung cấp
  type: String,             // Kiểu
  category: String,         // Danh mục
  importQty: { type: Number, default: 0 }, // Số lượng nhập
  exportQty: { type: Number, default: 0 }, // Số lượng xuất
  minUnitQty: { type: Number, default: 0 }, // SL quy đổi theo đơn vị nhỏ nhất
  price: { type: Number, default: 0 },     // Giá
  vat: { type: Number, default: 0 },       // VAT
  vatType: String,          // Loại vat
  cost: { type: Number, default: 0 },      // Giá vốn
  amount: { type: Number, default: 0 },    // Tiền
  discount: { type: Number, default: 0 },  // Chiết khấu
  totalAmount: { type: Number, default: 0 }, // Tổng tiền
  extendedWarranty: String, // Bảo hành mở rộng
  description: String,      // Mô tả
  createdAtStr: String,     // Ngày tạo (from CSV)
  unit: String,             // Đơn vị tính
  currentPrice: { type: Number, default: 0 }, // Giá bán hiện tại
  totalPriceAmount: { type: Number, default: 0 }, // Tổng tiền giá bán
  seller: String,           // Nhân viên bán hàng
  creator: String,          // Người tạo
  customer: String,         // Khách hàng
}, { timestamps: true, strict: false });

InventoryProductSchema.index({ id: 'text', voucherId: 'text', productCode: 'text', productName: 'text', creator: 'text', customer: 'text' });
export const InventoryProduct = model('InventoryProduct', InventoryProductSchema);


const WarehouseTransferSchema = new Schema({
  id: { type: String, required: true, unique: true },
  tabs: [String],
  date: String,
  type: String,
  warehouse: String,
  fromWarehouse: String,
  toWarehouse: String,
  label: String,
  qty: { type: Number, default: 0 },
  spCount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  creator: String,
  note: String,
}, { timestamps: true, strict: false });

WarehouseTransferSchema.index({ id: 'text', warehouse: 'text', type: 'text', creator: 'text' });
export const WarehouseTransfer = model('WarehouseTransfer', WarehouseTransferSchema);

