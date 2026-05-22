import { ShoppingCart } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersManagePage() {
  return (
    <DataModulePage
      title="Quản lý đơn hàng"
      subtitle="Danh sách các đơn hàng trong hệ thống"
      endpoint="/orders/manage"
      icon={<ShoppingCart size={22} />}
      fields={[
        { key: 'orderCode', label: 'Mã đơn hàng' },
        { key: 'customerName', label: 'Tên khách hàng' },
        { key: 'customerPhone', label: 'SĐT khách hàng' },
        { key: 'shippingAddress', label: 'Địa chỉ giao hàng' },
        { key: 'paymentMethod', label: 'P/T thanh toán' },
        { key: 'totalAmount', label: 'Tổng tiền', type: 'money' },
        { key: 'status', label: 'Trạng thái đơn', type: 'status' },
        { key: 'deliveryStatus', label: 'Vận chuyển', type: 'badge' },
        { key: 'note', label: 'Ghi chú' },
      ]}
      formFields={[
        { key: 'orderCode', label: 'Mã đơn hàng', required: true },
        { key: 'customerName', label: 'Tên khách hàng', required: true },
        { key: 'customerPhone', label: 'SĐT khách hàng' },
        { key: 'shippingAddress', label: 'Địa chỉ giao' },
        {
          key: 'paymentMethod', label: 'P/T thanh toán', type: 'select', options: [
            { label: 'COD', value: 'COD' },
            { label: 'Chuyển khoản', value: 'Chuyển khoản' },
            { label: 'Tiền mặt', value: 'Tiền mặt' },
          ],
        },
        { key: 'totalAmount', label: 'Tổng tiền', type: 'number' },
        {
          key: 'status', label: 'Trạng thái đơn', type: 'select', options: [
            { label: 'Chờ xử lý', value: 'Chờ xử lý' },
            { label: 'Đang xử lý', value: 'Đang xử lý' },
            { label: 'Hoàn thành', value: 'Hoàn thành' },
            { label: 'Đã hủy', value: 'Đã hủy' },
          ],
        },
        {
          key: 'deliveryStatus', label: 'Trạng thái giao', type: 'select', options: [
            { label: 'Chờ lấy hàng', value: 'Chờ lấy hàng' },
            { label: 'Đang giao', value: 'Đang giao' },
            { label: 'Đã giao', value: 'Đã giao' },
            { label: 'Hủy giao', value: 'Hủy giao' },
          ],
        },
        { key: 'note', label: 'Ghi chú', type: 'textarea' },
      ]}
      createDefaults={{
        orderCode: '', customerName: '', customerPhone: '', shippingAddress: '',
        paymentMethod: 'COD', totalAmount: 0, status: 'Chờ xử lý',
        deliveryStatus: 'Chờ lấy hàng', note: '',
      }}
      primaryActionLabel="Tạo đơn hàng"
      quickFilters={[
        { label: 'Chờ xử lý', value: 'Chờ xử lý' },
        { label: 'Đang xử lý', value: 'Đang xử lý' },
        { label: 'Hoàn thành', value: 'Hoàn thành' },
        { label: 'Đã hủy', value: 'Đã hủy' },
      ]}
    />
  );
}
