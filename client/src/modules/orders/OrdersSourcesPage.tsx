import { List } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersSourcesPage() {
  return (
    <DataModulePage
      title="Nguồn đơn hàng"
      subtitle="Theo dõi hiệu suất doanh thu từ các nguồn và kênh quảng cáo"
      endpoint="/orders/sources"
      icon={<List size={22} />}
      fields={[
        { key: 'sourceName', label: 'Tên nguồn đơn' },
        { key: 'sourceCode', label: 'Mã nguồn' },
        { key: 'orderCount', label: 'Tổng số đơn tạo' },
        { key: 'totalRevenue', label: 'Tổng doanh thu mang lại', type: 'money' },
        { key: 'isActive', label: 'Trạng thái hoạt động', type: 'status' },
      ]}
      formFields={[
        { key: 'sourceName', label: 'Tên nguồn', required: true },
        { key: 'sourceCode', label: 'Mã nguồn', required: true },
        { key: 'orderCount', label: 'Số lượng đơn hàng', type: 'number' },
        { key: 'totalRevenue', label: 'Doanh thu', type: 'number' },
        {
          key: 'isActive', label: 'Đang hoạt động', type: 'select', options: [
            { label: 'Kích hoạt', value: 'true' },
            { label: 'Tạm khóa', value: 'false' },
          ],
        },
      ]}
      createDefaults={{
        sourceName: '', sourceCode: '', orderCount: 0, totalRevenue: 0, isActive: true,
      }}
      primaryActionLabel="Thêm nguồn đơn hàng"
      normalizePayload={(payload) => ({
        ...payload,
        isActive: payload.isActive === 'true' || payload.isActive === true,
      })}
    />
  );
}
