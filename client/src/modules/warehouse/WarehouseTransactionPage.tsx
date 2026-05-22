import { Boxes, ReceiptText, ArrowDownLeft, ArrowUpRight, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TabbedModulePage } from '../../core/components/TabbedModulePage';

export function WarehouseTransactionPage() {
  const navigate = useNavigate();

  return (
    <TabbedModulePage
      tabs={[
        {
          key: 'vouchers',
          label: 'Phiếu xuất nhập kho',
          title: 'Phiếu xuất nhập kho',
          subtitle: 'Quản lý thông tin phiếu xuất và nhập kho',
          endpoint: '/warehouse/vouchers',
          icon: <ReceiptText size={24} />,
          primaryActionLabel: 'Tạo phiếu XNK',
          primaryActions: [
            {
              label: 'Nhập kho',
              icon: <ArrowDownLeft size={16} />,
              onClick: () => navigate('/warehouse/transactions/vouchers/import'),
            },
            {
              label: 'Xuất kho',
              icon: <ArrowUpRight size={16} />,
              onClick: () => navigate('/warehouse/transactions/vouchers/export'),
            },
            {
              label: 'Import xuất nhập kho',
              icon: <FileUp size={16} />,
              onClick: () => navigate('/warehouse/transactions/vouchers/excel'),
            },
          ],
          fields: [
            { key: 'voucherId', label: 'Mã phiếu' },
            { key: 'date', label: 'Ngày' },
            { key: 'warehouse', label: 'Kho hàng' },
            { key: 'type', label: 'Kiểu giao dịch' },
            { key: 'spCount', label: 'Số SP', type: 'number' },
            { key: 'qty', label: 'Số lượng', type: 'number' },
            { key: 'totalAmount', label: 'Tổng tiền', type: 'money' },
            { key: 'discount', label: 'Chiết khấu', type: 'money' },
            { key: 'creator', label: 'Người tạo' },
            { key: 'customerPhone', label: 'SĐT Khách hàng' },
            { key: 'note', label: 'Ghi chú' },
          ],
          formFields: [
            { key: 'voucherId', label: 'Mã phiếu XNK', required: true },
            { key: 'date', label: 'Ngày (dd/mm/yyyy)', required: true },
            { key: 'warehouse', label: 'Kho hàng', required: true },
            { key: 'type', label: 'Kiểu giao dịch', required: true },
            { key: 'spCount', label: 'Số sản phẩm (SP)', type: 'number' },
            { key: 'qty', label: 'Số lượng tổng (SL)', type: 'number' },
            { key: 'totalAmount', label: 'Tổng tiền', type: 'number' },
            { key: 'discount', label: 'Chiết khấu', type: 'number' },
            { key: 'creator', label: 'Người tạo' },
            { key: 'customerPhone', label: 'SĐT Khách hàng' },
            { key: 'note', label: 'Ghi chú', type: 'textarea' },
          ],
          createDefaults: {
            voucherId: '',
            date: '',
            warehouse: '',
            type: '',
            spCount: 0,
            qty: 0,
            totalAmount: 0,
            discount: 0,
            creator: '',
            customerPhone: '',
            note: '',
          },
        },
        {
          key: 'products',
          label: 'Sản phẩm xuất nhập kho',
          title: 'Sản phẩm xuất nhập kho',
          subtitle: 'Quản lý danh sách chi tiết các mặt hàng xuất nhập kho',
          endpoint: '/warehouse/products',
          icon: <Boxes size={24} />,
          primaryActionLabel: 'Thêm SP XNK',
          primaryActions: [
            {
              label: 'Nhập kho',
              icon: <ArrowDownLeft size={16} />,
              onClick: () => navigate('/warehouse/transactions/products/import'),
            },
            {
              label: 'Xuất kho',
              icon: <ArrowUpRight size={16} />,
              onClick: () => navigate('/warehouse/transactions/products/export'),
            },
          ],
          fields: [
            { key: 'id', label: 'ID giao dịch' },
            { key: 'voucherId', label: 'Mã phiếu XNK' },
            { key: 'date', label: 'Ngày' },
            { key: 'warehouse', label: 'Kho hàng' },
            { key: 'productCode', label: 'Mã sản phẩm' },
            { key: 'productName', label: 'Sản phẩm' },
            { key: 'barcode', label: 'Mã vạch' },
            { key: 'type', label: 'Kiểu' },
            { key: 'importQty', label: 'SL Nhập', type: 'number' },
            { key: 'exportQty', label: 'SL Xuất', type: 'number' },
            { key: 'price', label: 'Giá', type: 'money' },
            { key: 'totalAmount', label: 'Tổng tiền', type: 'money' },
            { key: 'creator', label: 'Người tạo' },
            { key: 'customer', label: 'Khách hàng' },
          ],
          formFields: [
            { key: 'id', label: 'ID giao dịch', required: true },
            { key: 'voucherId', label: 'Mã phiếu XNK', required: true },
            { key: 'date', label: 'Ngày (dd/mm/yyyy)', required: true },
            { key: 'warehouse', label: 'Kho hàng', required: true },
            { key: 'productCode', label: 'Mã sản phẩm', required: true },
            { key: 'productName', label: 'Tên sản phẩm', required: true },
            { key: 'barcode', label: 'Mã vạch' },
            { key: 'type', label: 'Kiểu' },
            { key: 'importQty', label: 'SL Nhập', type: 'number' },
            { key: 'exportQty', label: 'SL Xuất', type: 'number' },
            { key: 'price', label: 'Giá', type: 'number' },
            { key: 'totalAmount', label: 'Tổng tiền', type: 'number' },
            { key: 'creator', label: 'Người tạo' },
            { key: 'customer', label: 'Khách hàng' },
          ],
          createDefaults: {
            id: '',
            voucherId: '',
            date: '',
            warehouse: '',
            productCode: '',
            productName: '',
            barcode: '',
            type: '',
            importQty: 0,
            exportQty: 0,
            price: 0,
            totalAmount: 0,
            creator: '',
            customer: '',
          },
        },
      ]}
    />
  );
}

