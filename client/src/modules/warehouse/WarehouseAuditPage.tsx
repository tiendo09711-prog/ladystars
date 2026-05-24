import { ClipboardCheck, PackageSearch } from 'lucide-react';
import { TabbedModulePage } from '../../core/components/TabbedModulePage';
import { useNavigate } from 'react-router-dom';

export function WarehouseAuditPage() {
  const navigate = useNavigate();
  return (
    <TabbedModulePage
      tabs={[
        {
          key: 'checks',
          label: 'Kiểm kho',
          title: 'Kiểm kho',
          subtitle: 'Danh sách các phiếu kiểm kho',
          endpoint: '/warehouse/checks',
          icon: <ClipboardCheck size={24} />,
          primaryActionLabel: 'Tạo phiếu kiểm kho',
          onPrimaryActionClick: () => navigate('/warehouse/audit/create'),
          fields: [
            { key: 'id', label: 'ID' },
            { key: 'date', label: 'Ngày' },
            { key: 'type', label: 'Loại kiểm kho' },
            { key: 'warehouse', label: 'Kho' },
            { key: 'creator', label: 'Người tạo' },
            { key: 'spCount', label: 'SP', type: 'number' },
            { key: 'qty', label: 'SL', type: 'number' },
            { key: 'note', label: 'Ghi chú' },
            { key: 'missingSp', label: 'SP thiếu' },
            { key: 'balance', label: 'Bù trừ kiểm kho' },
          ],
          formFields: [
            { key: 'id', label: 'ID', required: true },
            { key: 'date', label: 'Ngày', required: true },
            { key: 'type', label: 'Loại kiểm kho' },
            { key: 'warehouse', label: 'Kho', required: true },
            { key: 'creator', label: 'Người tạo' },
            { key: 'spCount', label: 'SP', type: 'number' },
            { key: 'qty', label: 'SL', type: 'number' },
            { key: 'note', label: 'Ghi chú', type: 'textarea' },
            { key: 'missingSp', label: 'SP thiếu' },
            { key: 'balance', label: 'Bù trừ kiểm kho' },
          ],
          createDefaults: {
            id: '',
            date: '',
            type: 'Theo sản phẩm',
            warehouse: '',
            creator: '',
            spCount: 0,
            qty: 0,
            note: '',
            missingSp: '',
            balance: '',
          },
        },
        {
          key: 'check-products',
          label: 'Sản phẩm kiểm kho',
          title: 'Sản phẩm kiểm kho',
          subtitle: 'Chi tiết sản phẩm trong các đợt kiểm kho',
          endpoint: '/warehouse/check-products',
          icon: <PackageSearch size={24} />,
          primaryActionLabel: 'Thêm sản phẩm',
          fields: [
            { key: 'date', label: 'Ngày' },
            { key: 'warehouse', label: 'Kho' },
            { key: 'productName', label: 'Tên sản phẩm' },
            { key: 'cost', label: 'Giá vốn', type: 'money' },
            { key: 'price', label: 'Giá bán', type: 'money' },
            { key: 'stock', label: 'Tồn', type: 'number' },
            { key: 'transferring', label: 'Đang chuyển', type: 'number' },
            { key: 'actualStock', label: 'Tồn thực tế', type: 'number' },
            { key: 'difference', label: 'Chênh lệch', type: 'number' },
            { key: 'description', label: 'Mô tả' },
          ],
          formFields: [
            { key: 'date', label: 'Ngày', required: true },
            { key: 'warehouse', label: 'Kho', required: true },
            { key: 'productName', label: 'Tên sản phẩm', required: true },
            { key: 'cost', label: 'Giá vốn', type: 'number' },
            { key: 'price', label: 'Giá bán', type: 'number' },
            { key: 'stock', label: 'Tồn', type: 'number' },
            { key: 'transferring', label: 'Đang chuyển', type: 'number' },
            { key: 'actualStock', label: 'Tồn thực tế', type: 'number' },
            { key: 'difference', label: 'Chênh lệch', type: 'number' },
            { key: 'description', label: 'Mô tả', type: 'textarea' },
          ],
          createDefaults: {
            date: '',
            warehouse: '',
            productName: '',
            cost: 0,
            price: 0,
            stock: 0,
            transferring: 0,
            actualStock: 0,
            difference: 0,
            description: '',
          },
        },
      ]}
    />
  );
}
