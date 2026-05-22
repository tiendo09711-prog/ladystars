import { Package } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersPackagingPage() {
  return (
    <DataModulePage
      title="Đóng gói sản phẩm"
      subtitle="Theo dõi quá trình chuẩn bị hàng hóa và đóng gói"
      endpoint="/orders/packaging"
      icon={<Package size={22} />}
      fields={[
        { key: 'orderCode', label: 'Mã đơn hàng' },
        { key: 'customerName', label: 'Tên khách hàng' },
        { key: 'packer', label: 'Nhân viên đóng gói' },
        { key: 'packageWeight', label: 'Cân nặng (kg)', type: 'number' },
        { key: 'packagingMaterial', label: 'Vật liệu' },
        { key: 'status', label: 'Trạng thái đóng gói', type: 'status' },
        { key: 'packedAt', label: 'Thời gian hoàn tất' },
      ]}
      formFields={[
        { key: 'orderCode', label: 'Mã đơn hàng', required: true },
        { key: 'customerName', label: 'Tên khách hàng' },
        { key: 'packer', label: 'Nhân viên đóng gói' },
        { key: 'packageWeight', label: 'Trọng lượng (kg)', type: 'number' },
        { key: 'packagingMaterial', label: 'Chất liệu đóng gói' },
        {
          key: 'status', label: 'Trạng thái', type: 'select', options: [
            { label: 'Chờ đóng gói', value: 'Chờ đóng gói' },
            { label: 'Đang đóng gói', value: 'Đang đóng gói' },
            { label: 'Đã đóng gói', value: 'Đã đóng gói' },
          ],
        },
        { key: 'packedAt', label: 'Giờ hoàn tất' },
      ]}
      createDefaults={{
        orderCode: '', customerName: '', packer: '',
        packageWeight: 0, packagingMaterial: '', status: 'Chờ đóng gói', packedAt: '',
      }}
      primaryActionLabel="Thêm phiếu đóng gói"
      quickFilters={[
        { label: 'Chờ đóng gói', value: 'Chờ đóng gói' },
        { label: 'Đang đóng gói', value: 'Đang đóng gói' },
        { label: 'Đã đóng gói', value: 'Đã đóng gói' },
      ]}
    />
  );
}
