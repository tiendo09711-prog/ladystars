import { useParams } from 'react-router-dom';
import { DataModulePage } from '../../core/components/DataModulePage';
import { FindInvoicePage } from './FindInvoicePage';
import { RetailInvoicePage } from './RetailInvoicePage';
import {
  Search, ShoppingCart, ShoppingBag, FileText, RotateCcw, Gift,
  Store, Music2, Globe, Facebook, WalletCards,
} from 'lucide-react';

const CHANNEL_LABELS: Record<string, string> = {
  store: 'Cửa hàng',
  shopee: 'Shopee',
  tiktok: 'TikTok',
  lazada: 'Lazada',
  tiki: 'Tiki',
  facebook: 'Facebook Shop',
  'ecom-finance': 'Tài chính sàn TMDT',
  einvoice: 'Hóa đơn điện tử',
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  store:         <Store size={22} />,
  shopee:        <ShoppingBag size={22} />,
  tiktok:        <Music2 size={22} />,
  lazada:        <Globe size={22} />,
  tiki:          <ShoppingCart size={22} />,
  facebook:      <Facebook size={22} />,
  'ecom-finance': <WalletCards size={22} />,
  einvoice:      <FileText size={22} />,
};

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  find:        { label: 'Tìm hóa đơn',       icon: <Search size={22} />,       desc: 'Tra cứu hóa đơn' },
  retail:      { label: 'Bán lẻ',             icon: <ShoppingCart size={22} />, desc: 'Bán lẻ trực tiếp' },
  wholesale:   { label: 'Bán sỉ',             icon: <ShoppingBag size={22} />,  desc: 'Bán sỉ số lượng lớn' },
  einvoice:    { label: 'Hóa đơn điện tử',   icon: <FileText size={22} />,     desc: 'Hóa đơn VAT điện tử' },
  refund:      { label: 'Trả hàng',           icon: <RotateCcw size={22} />,    desc: 'Xử lý trả hàng' },
  'gift-debt': { label: 'Nợ quà tặng',        icon: <Gift size={22} />,         desc: 'Nợ quà tặng, khuyến mãi' },
};

export function SalesChannelSubPage() {
  const { channel = 'store', action = 'find' } = useParams<{ channel: string; action: string }>();

  if (action === 'find') {
    return <FindInvoicePage channel={channel} />;
  }

  if (action === 'retail') {
    return <RetailInvoicePage channel={channel} />;
  }


  const channelLabel = CHANNEL_LABELS[channel] ?? channel;
  const channelIcon = CHANNEL_ICONS[channel] ?? <Store size={22} />;
  const actionMeta = ACTION_META[action] ?? ACTION_META['find'];

  return (
    <DataModulePage
      title={`${actionMeta.label} — ${channelLabel}`}
      subtitle={`${actionMeta.desc} qua kênh ${channelLabel}`}
      endpoint={`/sales/orders?channel=${channel}&action=${action}`}
      icon={channelIcon}
      fields={[
        { key: 'code',       label: 'Mã hóa đơn' },
        { key: 'channel',    label: 'Kênh' },
        { key: 'status',     label: 'Trạng thái', type: 'status' },
        { key: 'customer',   label: 'Khách hàng' },
        { key: 'totalAmount',label: 'Tổng tiền',  type: 'money' },
        { key: 'createdAt',  label: 'Ngày tạo',   type: 'date' },
      ]}
      formFields={[
        { key: 'code',        label: 'Mã hóa đơn', required: true },
        { key: 'customer',    label: 'Khách hàng' },
        { key: 'totalAmount', label: 'Tổng tiền',   type: 'number' },
        { key: 'status',      label: 'Trạng thái',  type: 'select', options: [
          { label: 'Chờ xử lý',   value: 'pending' },
          { label: 'Hoàn thành',  value: 'completed' },
          { label: 'Đã hủy',      value: 'cancelled' },
        ]},
        { key: 'note',        label: 'Ghi chú',     type: 'textarea' },
      ]}
      createDefaults={{ code: '', customer: '', totalAmount: 0, status: 'pending', note: '' }}
      primaryActionLabel={`Tạo ${actionMeta.label}`}
      quickFilters={[
        { label: 'Chờ xử lý',  value: 'pending' },
        { label: 'Hoàn thành', value: 'completed' },
        { label: 'Đã hủy',     value: 'cancelled' },
      ]}
    />
  );
}
