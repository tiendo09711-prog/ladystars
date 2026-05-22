import { History } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersHistoryPage() {
  return (
    <DataModulePage
      title="Lịch sử sửa xóa đơn hàng"
      subtitle="Nhật ký chi tiết các thao tác sửa đổi và xóa bỏ dữ liệu đơn hàng"
      endpoint="/orders/history"
      icon={<History size={22} />}
      fields={[
        { key: 'actionType', label: 'Thao tác thực hiện', type: 'status' },
        { key: 'orderCode', label: 'Mã đơn hàng liên quan' },
        { key: 'staffName', label: 'Nhân viên thực hiện' },
        { key: 'details', label: 'Chi tiết thay đổi' },
        { key: 'createdAtStr', label: 'Thời gian ghi nhận' },
      ]}
      formFields={[
        {
          key: 'actionType', label: 'Thao tác', type: 'select', options: [
            { label: 'Sửa thông tin', value: 'Sửa thông tin' },
            { label: 'Xóa đơn', value: 'Xóa đơn' },
          ],
        },
        { key: 'orderCode', label: 'Mã đơn', required: true },
        { key: 'staffName', label: 'Nhân viên' },
        { key: 'details', label: 'Chi tiết nội dung', type: 'textarea' },
        { key: 'createdAtStr', label: 'Thời gian tạo' },
      ]}
      createDefaults={{
        actionType: 'Sửa thông tin', orderCode: '', staffName: '', details: '', createdAtStr: '',
      }}
      primaryActionLabel="Ghi nhận nhật ký"
      quickFilters={[
        { label: 'Sửa thông tin', value: 'Sửa thông tin' },
        { label: 'Xóa đơn', value: 'Xóa đơn' },
      ]}
    />
  );
}
