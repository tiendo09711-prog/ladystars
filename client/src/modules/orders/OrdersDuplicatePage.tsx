import { Search } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersDuplicatePage() {
  return (
    <DataModulePage
      title="Đơn trùng lặp"
      subtitle="Quản lý và rà soát các đơn đặt hàng bị trùng thông tin"
      endpoint="/orders/duplicates"
      icon={<Search size={22} />}
      fields={[
        { key: 'orderCode', label: 'Mã đơn' },
        { key: 'duplicateCode', label: 'Đơn bị trùng' },
        { key: 'customerName', label: 'Khách hàng' },
        { key: 'customerPhone', label: 'SĐT khách hàng' },
        { key: 'totalAmount', label: 'Giá trị đơn', type: 'money' },
        { key: 'reason', label: 'Lý do cảnh báo trùng' },
        { key: 'status', label: 'Trạng thái', type: 'status' },
      ]}
      formFields={[
        { key: 'orderCode', label: 'Mã đơn gốc', required: true },
        { key: 'duplicateCode', label: 'Mã đơn trùng', required: true },
        { key: 'customerName', label: 'Tên khách hàng' },
        { key: 'customerPhone', label: 'Số điện thoại' },
        { key: 'totalAmount', label: 'Giá trị đơn', type: 'number' },
        { key: 'reason', label: 'Lý do trùng', type: 'textarea' },
        {
          key: 'status', label: 'Trạng thái', type: 'select', options: [
            { label: 'Mới', value: 'Mới' },
            { label: 'Đang xử lý', value: 'Đang xử lý' },
            { label: 'Đã xử lý', value: 'Đã xử lý' },
          ],
        },
      ]}
      createDefaults={{
        orderCode: '', duplicateCode: '', customerName: '',
        customerPhone: '', totalAmount: 0, reason: '', status: 'Mới',
      }}
      primaryActionLabel="Ghi nhận đơn trùng"
      quickFilters={[
        { label: 'Mới', value: 'Mới' },
        { label: 'Đã xử lý', value: 'Đã xử lý' },
      ]}
    />
  );
}
