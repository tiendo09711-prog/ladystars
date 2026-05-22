import { Schema, model } from 'mongoose';

const money = { type: Number, default: 0, min: 0 };

// 1. Đơn hàng
const OrderSchema = new Schema({
  orderCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: String,
  shippingAddress: String,
  paymentMethod: { type: String, default: 'COD' },
  totalAmount: money,
  status: { type: String, default: 'Chờ xử lý' },
  deliveryStatus: { type: String, default: 'Chờ lấy hàng' },
  note: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderSchema.index({ orderCode: 'text', customerName: 'text', customerPhone: 'text' });
export const Order = model('Order', OrderSchema);

// 2. Đơn trùng
const OrderDuplicateSchema = new Schema({
  orderCode: { type: String, required: true },
  duplicateCode: { type: String, required: true },
  customerName: String,
  customerPhone: String,
  totalAmount: money,
  reason: String,
  status: { type: String, default: 'Mới' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderDuplicateSchema.index({ orderCode: 'text', customerName: 'text', customerPhone: 'text' });
export const OrderDuplicate = model('OrderDuplicate', OrderDuplicateSchema);

// 3. Đóng gói
const OrderPackagingSchema = new Schema({
  orderCode: { type: String, required: true, unique: true },
  customerName: String,
  packer: String,
  packageWeight: { type: Number, default: 0 },
  packagingMaterial: String,
  status: { type: String, default: 'Chờ đóng gói' },
  packedAt: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderPackagingSchema.index({ orderCode: 'text', customerName: 'text', packer: 'text' });
export const OrderPackaging = model('OrderPackaging', OrderPackagingSchema);

// 4. Biên bản bàn giao
const OrderHandoverSchema = new Schema({
  handoverCode: { type: String, required: true, unique: true },
  carrier: String,
  orderCount: { type: Number, default: 0 },
  handoverStaff: String,
  carrierStaff: String,
  status: { type: String, default: 'Đang kiểm đếm' },
  handoverDate: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderHandoverSchema.index({ handoverCode: 'text', carrier: 'text', handoverStaff: 'text' });
export const OrderHandover = model('OrderHandover', OrderHandoverSchema);

// 5. Chờ gửi vận chuyển
const OrderShippingPendingSchema = new Schema({
  orderCode: { type: String, required: true, unique: true },
  carrier: String,
  customerName: String,
  customerPhone: String,
  shippingFee: money,
  codAmount: money,
  status: { type: String, default: 'Chờ lấy hàng' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderShippingPendingSchema.index({ orderCode: 'text', carrier: 'text', customerName: 'text' });
export const OrderShippingPending = model('OrderShippingPending', OrderShippingPendingSchema);

// 6. Khiếu nại
const OrderDisputeSchema = new Schema({
  disputeCode: { type: String, required: true, unique: true },
  orderCode: String,
  customerName: String,
  customerPhone: String,
  disputeType: String,
  description: String,
  solution: String,
  status: { type: String, default: 'Chờ xử lý' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderDisputeSchema.index({ disputeCode: 'text', orderCode: 'text', customerName: 'text' });
export const OrderDispute = model('OrderDispute', OrderDisputeSchema);

// 7. Đối soát COD
const OrderCodControlSchema = new Schema({
  controlCode: { type: String, required: true, unique: true },
  carrier: String,
  totalCodCollected: money,
  totalFee: money,
  amountPaid: money,
  status: { type: String, default: 'Đã đối soát' },
  controlDate: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderCodControlSchema.index({ controlCode: 'text', carrier: 'text' });
export const OrderCodControl = model('OrderCodControl', OrderCodControlSchema);

// 8. Nguồn đơn hàng
const OrderSourceSchema = new Schema({
  sourceName: { type: String, required: true, unique: true },
  sourceCode: String,
  orderCount: { type: Number, default: 0 },
  totalRevenue: money,
  isActive: { type: Boolean, default: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderSourceSchema.index({ sourceName: 'text', sourceCode: 'text' });
export const OrderSource = model('OrderSource', OrderSourceSchema);

// 9. Lịch sử sửa xóa
const OrderHistorySchema = new Schema({
  actionType: String,
  orderCode: String,
  staffName: String,
  details: String,
  createdAtStr: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
OrderHistorySchema.index({ orderCode: 'text', staffName: 'text', actionType: 'text' });
export const OrderHistory = model('OrderHistory', OrderHistorySchema);
