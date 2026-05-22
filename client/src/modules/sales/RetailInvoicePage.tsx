import { FileSpreadsheet, WalletCards } from 'lucide-react';
import { TabbedModulePage } from '../../core/components/TabbedModulePage';

type RetailInvoicePageProps = {
  channel: string;
};

export function RetailInvoicePage({ channel: _channel }: RetailInvoicePageProps) {
  return (
    <TabbedModulePage
      tabs={[
        {
          key: 'all',
          label: 'Tất cả',
          title: 'Hóa đơn bán lẻ - Tất cả',
          subtitle: 'Danh sách tất cả hóa đơn bán lẻ',
          endpoint: '/products/retail-invoices?tabs=all',
          icon: <FileSpreadsheet size={24} />,
          primaryActionLabel: 'Thêm hóa đơn lẻ',
          fields: [
            { key: 'date', label: 'Ngày' },
            { key: 'id', label: 'ID' },
            { key: 'orderId', label: 'ID đơn hàng' },
            { key: 'type', label: 'Kiểu' },
            { key: 'customerName', label: 'Khách hàng' },
            { key: 'productCode', label: 'Mã sản phẩm' },
            { key: 'productName', label: 'Tên sản phẩm' },
            { key: 'totalAmount', label: 'Tổng tiền', type: 'money' },
            { key: 'status', label: 'Trạng thái', type: 'status' },
          ],
          formFields: [
            { key: 'id', label: 'ID Hóa đơn', required: true },
            { key: 'date', label: 'Ngày (dd/mm/yyyy hh:mm:ss)', required: true },
            { key: 'orderId', label: 'ID đơn hàng' },
            { key: 'type', label: 'Kiểu', required: true },
            { key: 'customerName', label: 'Khách hàng', required: true },
            { key: 'productCode', label: 'Mã sản phẩm', required: true },
            { key: 'productName', label: 'Tên sản phẩm', required: true },
            { key: 'totalAmount', label: 'Tổng tiền', type: 'number', required: true },
            {
              key: 'status',
              label: 'Trạng thái',
              type: 'select',
              options: [
                { label: 'Mới', value: 'Mới' },
                { label: 'Đã thanh toán', value: 'Đã thanh toán' },
                { label: 'Đã hủy', value: 'Đã hủy' },
              ],
            },
          ],
          createDefaults: {
            id: '',
            tabs: ['all'],
            date: new Date().toLocaleString('vi-VN'),
            orderId: '',
            type: 'Xuất bán lẻ [L]',
            customerName: '',
            productCode: '',
            productName: '',
            totalAmount: 0,
            status: 'Mới',
          },
        },
        {
          key: 'confirm',
          label: 'Xác nhận thanh toán',
          title: 'Bán lẻ - Xác nhận thanh toán',
          subtitle: 'Danh sách giao dịch chuyển khoản chờ xác nhận',
          endpoint: '/products/retail-invoices?tabs=confirm',
          icon: <WalletCards size={24} />,
          primaryActionLabel: 'Thêm xác nhận thanh toán',
          fields: [
            { key: 'orderId', label: 'ID đơn hàng' },
            { key: 'senderName', label: 'Khách chuyển khoản' },
            { key: 'transactionCode', label: 'Mã giao dịch' },
            { key: 'bankName', label: 'Ngân hàng' },
            { key: 'bankAccountNo', label: 'Số tài khoản' },
            { key: 'transactionDate', label: 'Ngày giao dịch' },
            { key: 'store', label: 'Cửa hàng' },
            { key: 'transactionContent', label: 'Nội dung giao dịch' },
            { key: 'confirmedBy', label: 'Người xác nhận' },
          ],
          formFields: [
            { key: 'orderId', label: 'ID đơn hàng', required: true },
            { key: 'senderName', label: 'Khách chuyển khoản', required: true },
            { key: 'transactionCode', label: 'Mã giao dịch', required: true },
            { key: 'bankName', label: 'Ngân hàng', required: true },
            { key: 'bankAccountNo', label: 'Số tài khoản' },
            { key: 'transactionDate', label: 'Ngày giao dịch' },
            { key: 'store', label: 'Cửa hàng' },
            { key: 'transactionContent', label: 'Nội dung giao dịch', type: 'textarea' },
            { key: 'confirmedBy', label: 'Người xác nhận' },
          ],
          createDefaults: {
            tabs: ['confirm'],
            orderId: '',
            senderName: '',
            transactionCode: '',
            bankName: '',
            bankAccountNo: '',
            transactionDate: new Date().toLocaleDateString('vi-VN'),
            store: '',
            transactionContent: '',
            confirmedBy: '',
          },
        },
      ]}
    />
  );
}
