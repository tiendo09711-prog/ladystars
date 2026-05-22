import { FileText } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersHandoverPage() {
  return (
    <DataModulePage
      title="Biên bản bàn giao"
      subtitle="Bàn giao đơn hàng cho các đối tác vận chuyển"
      endpoint="/orders/handover"
      icon={<FileText size={22} />}
      fields={[
        { key: 'handoverCode', label: 'Mã biên bản' },
        { key: 'carrier', label: 'Nhà vận chuyển' },
        { key: 'orderCount', label: 'Số lượng đơn' },
        { key: 'handoverStaff', label: 'Nhân viên bàn giao' },
        { key: 'carrierStaff', label: 'Bưu tá nhận hàng' },
        { key: 'status', label: 'Trạng thái', type: 'status' },
        { key: 'handoverDate', label: 'Ngày tạo' },
      ]}
      formFields={[
        { key: 'handoverCode', label: 'Mã bàn giao', required: true },
        { key: 'carrier', label: 'Hãng vận chuyển', required: true },
        { key: 'orderCount', label: 'Số lượng đơn', type: 'number' },
        { key: 'handoverStaff', label: 'Nhân viên bàn giao' },
        { key: 'carrierStaff', label: 'Bưu tá nhận hàng' },
        {
          key: 'status', label: 'Trạng thái', type: 'select', options: [
            { label: 'Đang kiểm đếm', value: 'Đang kiểm đếm' },
            { label: 'Đã bàn giao', value: 'Đã bàn giao' },
            { label: 'Trục trặc', value: 'Trục trặc' },
          ],
        },
        { key: 'handoverDate', label: 'Ngày lập (yyyy-mm-dd)' },
      ]}
      createDefaults={{
        handoverCode: '', carrier: '', orderCount: 0,
        handoverStaff: '', carrierStaff: '', status: 'Đang kiểm đếm', handoverDate: '',
      }}
      primaryActionLabel="Tạo biên bản bàn giao"
      quickFilters={[
        { label: 'Đang kiểm đếm', value: 'Đang kiểm đếm' },
        { label: 'Đã bàn giao', value: 'Đã bàn giao' },
      ]}
    />
  );
}
