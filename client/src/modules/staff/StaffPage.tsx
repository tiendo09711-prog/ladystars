import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, RefreshCw, Search, Trash2, Unlock, UserCog, Users, WalletCards } from 'lucide-react';
import { http } from '../../core/api/http';

type StaffAccount = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  status: 'open' | 'lock';
  lastLoginAt?: string;
  createdAt?: string;
};

type StaffStats = {
  summary: {
    salesCount: number;
    refundCount: number;
    revenue: number;
    paid: number;
    debt: number;
    refundValue: number;
    receiptsValue: number;
    expensesValue: number;
  };
  recentSales: { _id: string; code: string; value: number; valuePayment: number; status: string; createdAt: string }[];
  recentRefunds: { _id: string; code: string; value: number; status: string; createdAt: string }[];
};

const tabs = [
  { key: 'create', path: '/staff/create', label: 'Tạo tài khoản' },
  { key: 'accounts', path: '/staff/accounts', label: 'Danh sách tài khoản' },
  { key: 'stats', path: '/staff/stats', label: 'Thống kê nhân viên' },
];

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;
const today = () => new Date().toISOString().slice(0, 10);

export function StaffPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = useMemo(() => {
    if (location.pathname.endsWith('/create')) return 'create';
    if (location.pathname.endsWith('/stats')) return 'stats';
    return 'accounts';
  }, [location.pathname]);

  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', status: 'open' });
  const [resetPassword, setResetPassword] = useState<Record<string, string>>({});
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [activity, setActivity] = useState<Record<string, any>[]>([]);

  const loadStaff = async () => {
    const response = await http.get('/staff');
    const items = response.data.items ?? [];
    setStaff(items);
    if (!selectedStaffId && items[0]?._id) setSelectedStaffId(items[0]._id);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filteredStaff = staff.filter((item) => {
    const text = `${item.name} ${item.email} ${item.phone ?? ''}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const createStaff = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    await http.post('/staff', form);
    setForm({ name: '', email: '', password: '', phone: '', status: 'open' });
    setMessage('Đã tạo tài khoản nhân viên.');
    await loadStaff();
    navigate('/staff/accounts');
  };

  const updateStatus = async (item: StaffAccount, status: 'open' | 'lock') => {
    await http.patch(`/staff/${item._id}/${status}`);
    await loadStaff();
  };

  const deleteStaff = async (item: StaffAccount) => {
    if (!window.confirm(`Xóa mềm tài khoản ${item.email}?`)) return;
    await http.delete(`/staff/${item._id}`);
    await loadStaff();
  };

  const submitResetPassword = async (item: StaffAccount) => {
    const password = resetPassword[item._id];
    if (!password || password.length < 6) {
      setMessage('Mật khẩu mới cần ít nhất 6 ký tự.');
      return;
    }
    await http.post(`/staff/${item._id}/reset-password`, { password });
    setResetPassword((current) => ({ ...current, [item._id]: '' }));
    setMessage(`Đã đặt lại mật khẩu cho ${item.email}.`);
  };

  const loadStats = async () => {
    if (!selectedStaffId) return;
    const [statsResponse, activityResponse] = await Promise.all([
      http.get(`/staff/${selectedStaffId}/stats`, { params: { from, to } }),
      http.get(`/staff/${selectedStaffId}/activity`, { params: { from, to } }),
    ]);
    setStats(statsResponse.data);
    setActivity(activityResponse.data.items ?? []);
  };

  useEffect(() => {
    if (activeTab === 'stats') loadStats();
  }, [activeTab, selectedStaffId]);

  return (
    <div className="workspace-page">
      <div className="workspace-tabs" role="tablist" aria-label="Staff tabs">
        {tabs.map((tab) => (
          <button className={activeTab === tab.key ? 'active' : ''} key={tab.key} type="button" onClick={() => navigate(tab.path)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="page-stack">
        <div className="page-heading">
          <div className="page-title-block">
            <div className="page-icon"><UserCog size={24} /></div>
            <div>
              <h1>Quản lý nhân viên</h1>
              <p>Tạo tài khoản, khóa/mở khóa, đặt lại mật khẩu và xem hiệu suất nhân viên.</p>
            </div>
          </div>
          <button className="btn btn-light" type="button" onClick={loadStaff}>
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>

        {message && <div className="error-chip">{message}</div>}

        {activeTab === 'create' && (
          <form className="data-card" onSubmit={createStaff}>
            <div className="data-card-header">
              <div>
                <h2>Tạo tài khoản Staff</h2>
                <span className="record-badge">Role Staff</span>
              </div>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Tên nhân viên *</span>
                <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Email *</span>
                <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Mật khẩu *</span>
                <input required type="password" minLength={6} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Số điện thoại</span>
                <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Trạng thái</span>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="open">Open</option>
                  <option value="lock">Lock</option>
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" type="submit">Tạo tài khoản</button>
            </div>
          </form>
        )}

        {activeTab === 'accounts' && (
          <section className="data-card">
            <div className="data-card-header">
              <div>
                <h2>Danh sách tài khoản</h2>
                <span className="record-badge">{filteredStaff.length} nhân viên</span>
              </div>
              <div className="search-box">
                <Search size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm nhân viên..." />
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái</th>
                    <th>Đăng nhập gần nhất</th>
                    <th className="action-cell">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong><small>{item.email}</small></td>
                      <td>{item.phone || '-'}</td>
                      <td><span className={`status-badge ${item.status === 'open' ? 'success' : 'danger'}`}>{item.status === 'open' ? 'Open' : 'Lock'}</span></td>
                      <td>{item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString('vi-VN') : '-'}</td>
                      <td className="action-cell">
                        <input
                          className="inline-password"
                          type="password"
                          placeholder="Mật khẩu mới"
                          value={resetPassword[item._id] ?? ''}
                          onChange={(event) => setResetPassword((current) => ({ ...current, [item._id]: event.target.value }))}
                        />
                        <button className="mini-action" type="button" onClick={() => submitResetPassword(item)}>Reset</button>
                        {item.status === 'open' ? (
                          <button className="mini-action" type="button" onClick={() => updateStatus(item, 'lock')}><Lock size={13} /> Lock</button>
                        ) : (
                          <button className="mini-action" type="button" onClick={() => updateStatus(item, 'open')}><Unlock size={13} /> Open</button>
                        )}
                        {item.status === 'lock' && (
                          <button className="icon-button danger" type="button" onClick={() => deleteStaff(item)} title="Xóa tài khoản">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'stats' && (
          <div className="page-stack">
            <section className="data-card">
              <div className="form-grid">
                <label className="form-field">
                  <span>Nhân viên</span>
                  <select value={selectedStaffId} onChange={(event) => setSelectedStaffId(event.target.value)}>
                    {staff.map((item) => <option key={item._id} value={item._id}>{item.name} - {item.email}</option>)}
                  </select>
                </label>
                <label className="form-field">
                  <span>Từ ngày</span>
                  <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                </label>
                <label className="form-field">
                  <span>Đến ngày</span>
                  <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                </label>
                <div className="form-field">
                  <span>&nbsp;</span>
                  <button className="btn btn-primary" type="button" onClick={loadStats}>
                    <WalletCards size={16} /> Xem thống kê
                  </button>
                </div>
              </div>
            </section>

            {stats && (
              <>
                <div className="metric-row">
                  <div className="metric-card"><span>Số đơn</span><strong>{stats.summary.salesCount}</strong></div>
                  <div className="metric-card success"><span>Doanh số</span><strong>{money(stats.summary.revenue)}</strong></div>
                  <div className="metric-card"><span>Đã thu</span><strong>{money(stats.summary.paid)}</strong></div>
                  <div className="metric-card warning"><span>Công nợ</span><strong>{money(stats.summary.debt)}</strong></div>
                  <div className="metric-card danger"><span>Hoàn hàng</span><strong>{stats.summary.refundCount}</strong></div>
                </div>

                <section className="data-card">
                  <div className="data-card-header"><h2>Lịch sử thao tác</h2></div>
                  <div className="table-scroll">
                    <table className="data-table">
                      <tbody>
                        {activity.map((item) => (
                          <tr key={item._id}>
                            <td><strong>{item.action}</strong><small>{item.module}</small></td>
                            <td>{item.resource}</td>
                            <td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                          </tr>
                        ))}
                        {activity.length === 0 && <tr><td className="empty-cell">Chưa có lịch sử trong khoảng thời gian này.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
