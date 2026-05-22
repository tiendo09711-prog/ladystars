import { ClipboardCheck } from 'lucide-react';
import { DataModulePage } from '../../core/components/DataModulePage';

export function OrdersCodControlPage() {
  return (
    <DataModulePage
      title="Đối soát COD"
      subtitle="Bảng theo dõi và khớp tiền thu hộ COD từ các hãng vận chuyển"
      endpoint="/orders/cod-control"
      icon={<ClipboardCheck size={22} />}
      fields={[
        { key: 'controlCode', label: 'Mã đối soát' },
        { key: 'carrier', label: 'Hãng vận chuyển' },
        { key: 'totalCodCollected', label: 'Tổng tiền COD thu hộ', type: 'money' },
        { key: 'totalFee', label: 'Tổng phí vận chuyển', type: 'money' },
        { key: 'amountPaid', label: 'Thực nhận chuyển khoản', type: 'money' },
        { key: 'status', label: 'Trạng thái đối soát', type: 'status' },
        { key: 'controlDate', label: 'Ngày đối soát' },
      ]}
      formFields={[
        { key: 'controlCode', label: 'Mã đối soát', required: true },
        { key: 'carrier', label: 'Đơn vị vận chuyển', required: true },
        { key: 'totalCodCollected', label: 'Tổng thu COD', type: 'number' },
        { key: 'totalFee', label: 'Phí ship tổng', type: 'number' },
        { key: 'amountPaid', label: 'Thành tiền chuyển khoản', type: 'number' },
        {
          key: 'status', label: 'Trạng thái', type: 'select', options: [
            { label: 'Đã đối soát', value: 'Đã đối soát' },
            { label: 'Lệch số liệu', value: 'Lệch số liệu' },
          ],
        },
        { key: 'controlDate', label: 'Ngày thực hiện' },
      ]}
      createDefaults={{
        controlCode: '', carrier: '', totalCodCollected: 0,
        totalFee: 0, amountPaid: 0, status: 'Đã đối soát', controlDate: '',
      }}
      primaryActionLabel="Tạo bảng đối soát"
      quickFilters={[
        { label: 'Đã đối soát', value: 'Đã đối soát' },
        { label: 'Lệch số liệu', value: 'Lệch số liệu' },
      ]}
    />
  );
}
