import { AlertTriangle } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersDisputesPage() {
  return (
    <DataModulePage
      title="Khiếu nại đơn hàng"
      subtitle="Tiếp nhận và giải quyết các khiếu nại của khách hàng"
      endpoint="/orders/disputes"
      icon={<AlertTriangle size={22} />}
      fields={[
        { key: 'disputeCode', label: 'Mã khiếu nại' },
        { key: 'orderCode', label: 'Mã đơn gốc' },
        { key: 'customerName', label: 'Khách hàng' },
        { key: 'customerPhone', label: 'SĐT khách hàng' },
        { key: 'disputeType', label: 'Loại khiếu nại' },
        { key: 'description', label: 'Mô tả chi tiết' },
        { key: 'solution', label: 'Phương án xử lý' },
        { key: 'status', label: 'Trạng thái giải quyết', type: 'status' },
      ]}
      formFields={[
        { key: 'disputeCode', label: 'Mã khiếu nại', required: true },
        { key: 'orderCode', label: 'Mã đơn gốc', required: true },
        { key: 'customerName', label: 'Khách hàng' },
        { key: 'customerPhone', label: 'Số điện thoại' },
        {
          key: 'disputeType', label: 'Phân loại khiếu nại', type: 'select', options: [
            { label: 'Hàng hỏng do vận chuyển', value: 'Hàng hỏng do vận chuyển' },
            { label: 'Giao thiếu hàng', value: 'Giao thiếu hàng' },
            { label: 'Giao sai sản phẩm', value: 'Giao sai sản phẩm' },
            { label: 'Khác', value: 'Khác' },
          ],
        },
        { key: 'description', label: 'Mô tả chi tiết', type: 'textarea' },
        { key: 'solution', label: 'Phương án giải quyết', type: 'textarea' },
        {
          key: 'status', label: 'Trạng thái', type: 'select', options: [
            { label: 'Chờ xử lý', value: 'Chờ xử lý' },
            { label: 'Đang xử lý', value: 'Đang xử lý' },
            { label: 'Đã xử lý', value: 'Đã xử lý' },
          ],
        },
      ]}
      createDefaults={{
        disputeCode: '', orderCode: '', customerName: '', customerPhone: '',
        disputeType: 'Hàng hỏng do vận chuyển', description: '', solution: '', status: 'Chờ xử lý',
      }}
      primaryActionLabel="Tạo đơn khiếu nại"
      quickFilters={[
        { label: 'Chờ xử lý', value: 'Chờ xử lý' },
        { label: 'Đang xử lý', value: 'Đang xử lý' },
        { label: 'Đã xử lý', value: 'Đã xử lý' },
      ]}
    />
  );
}
