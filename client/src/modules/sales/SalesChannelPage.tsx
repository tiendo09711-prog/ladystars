import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, ShoppingCart, ShoppingBag, FileText, RotateCcw, Gift,
  Store, Music2, Globe, Facebook, WalletCards, ArrowRight,
} from 'lucide-react';

const CHANNEL_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  store:        { label: 'Cửa hàng',           icon: <Store size={28} />,       color: '#2563eb', bg: '#eff6ff' },
  shopee:       { label: 'Shopee',              icon: <ShoppingBag size={28} />, color: '#ea580c', bg: '#fff7ed' },
  tiktok:       { label: 'TikTok',              icon: <Music2 size={28} />,      color: '#0f172a', bg: '#f8fafc' },
  lazada:       { label: 'Lazada',              icon: <Globe size={28} />,       color: '#7c3aed', bg: '#f5f3ff' },
  tiki:         { label: 'Tiki',                icon: <ShoppingCart size={28} />,color: '#0284c7', bg: '#f0f9ff' },
  facebook:     { label: 'Facebook Shop',       icon: <Facebook size={28} />,    color: '#1d4ed8', bg: '#eff6ff' },
  'ecom-finance':{ label: 'Tài chính sàn TMDT', icon: <WalletCards size={28} />,color: '#059669', bg: '#ecfdf5' },
};

const ACTIONS = [
  {
    key: 'find',
    label: 'Tìm hóa đơn',
    desc: 'Tra cứu, tìm kiếm hóa đơn theo nhiều tiêu chí',
    icon: <Search size={26} />,
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    key: 'retail',
    label: 'Bán lẻ',
    desc: 'Tạo đơn bán lẻ trực tiếp cho khách hàng',
    icon: <ShoppingCart size={26} />,
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    key: 'wholesale',
    label: 'Bán sỉ',
    desc: 'Tạo đơn bán sỉ với giá đặc biệt theo số lượng',
    icon: <ShoppingBag size={26} />,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    key: 'refund',
    label: 'Trả hàng',
    desc: 'Xử lý đơn trả hàng, hoàn tiền khách hàng',
    icon: <RotateCcw size={26} />,
    color: '#dc2626',
    bg: '#fef2f2',
  },
];

export function SalesChannelPage() {
  const { channel = 'store' } = useParams<{ channel: string }>();
  const navigate = useNavigate();
  const meta = CHANNEL_META[channel] ?? CHANNEL_META['store'];

  return (
    <div className="workspace-page">
      {/* Header */}
      <div className="page-heading">
        <div className="page-title-block">
          <div
            className="page-icon"
            style={{ background: meta.bg, color: meta.color, width: 52, height: 52, borderRadius: 14 }}
          >
            {meta.icon}
          </div>
          <div>
            <h1 style={{ fontSize: 24 }}>Kênh bán — {meta.label}</h1>
            <p style={{ margin: '3px 0 0', color: 'var(--muted)', fontSize: 13 }}>
              Quản lý tất cả hoạt động bán hàng qua kênh <strong>{meta.label}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Channel badge banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 18px',
        background: meta.bg,
        border: `1px solid ${meta.color}30`,
        borderRadius: 12,
        borderLeft: `4px solid ${meta.color}`,
      }}>
        <div style={{ color: meta.color }}>{meta.icon}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: meta.color }}>{meta.label}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Chọn chức năng bên dưới để bắt đầu xử lý đơn hàng</div>
        </div>
      </div>

      {/* Action cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => navigate(`/sales-channels/${channel}/${action.key}`)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              padding: '20px 20px',
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s ease',
              boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = action.color + '60';
              el.style.boxShadow = `0 4px 18px ${action.color}20`;
              el.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--border)';
              el.style.boxShadow = '0 1px 3px rgba(15,23,42,0.05)';
              el.style.transform = 'translateY(0)';
            }}
          >
            {/* Color accent stripe */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 4,
              height: '100%',
              background: action.color,
              borderRadius: '12px 0 0 12px',
            }} />

            {/* Icon */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: action.bg,
              color: action.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 4,
            }}>
              {action.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                {action.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                {action.desc}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight size={16} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 4 }} />
          </button>
        ))}
      </div>

      {/* Quick stats row */}
      <div className="metric-row">
        {[
          { label: 'Đơn hôm nay', value: '—', tone: 'primary' as const },
          { label: 'Doanh thu hôm nay', value: '—', tone: 'success' as const },
          { label: 'Đơn chờ xử lý', value: '—', tone: 'warning' as const },
          { label: 'Trả hàng', value: '—', tone: 'danger' as const },
        ].map(m => (
          <div key={m.label} className={`metric-card ${m.tone}`}>
            <span>{m.label}</span>
            <strong>{m.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
