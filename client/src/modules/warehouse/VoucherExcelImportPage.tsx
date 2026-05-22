import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUp, ArrowLeft, Download, FileSpreadsheet, CheckCircle2, Trash2 } from 'lucide-react';
import { http } from '../../core/api/http';

export function VoucherExcelImportPage() {
  const navigate = useNavigate();

  // Form states
  const [type, setType] = useState('import'); // Kiểu: import (nhập) or export (xuất)
  const [voucherType, setVoucherType] = useState('Nhập mua');
  const [voucherSubtype, setVoucherSubtype] = useState('Phiếu thường');
  const [warehouse, setWarehouse] = useState('Kho chính');
  
  const [vatType, setVatType] = useState('%');
  const [vatValue, setVatValue] = useState(0);

  const [discountType, setDiscountType] = useState('%');
  const [discountValue, setDiscountValue] = useState(0);

  const [note, setNote] = useState('');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sample mock preview rows when a file is imported
  const [mockPreviewRows, setMockPreviewRows] = useState<Array<{ code: string; name: string; qty: number; price: number }>>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      setError('Vui lòng chỉ tải lên file Excel (.xlsx hoặc .xls)');
      setSelectedFile(null);
      setMockPreviewRows([]);
      return;
    }
    
    setError('');
    setSelectedFile(file);
    setUploadProgress(10);
    
    // Simulate upload/parse progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Show mock parsed excel rows
          setMockPreviewRows([
            { code: 'SP001', name: 'Kem chống nắng LadyStars SPF 50+', qty: 50, price: 90000 },
            { code: 'SP002', name: 'Sữa rửa mặt dịu nhẹ LadyStars', qty: 30, price: 70000 },
            { code: 'SP003', name: 'Serum tế bào gốc trẻ hóa da', qty: 15, price: 280000 }
          ]);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setMockPreviewRows([]);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError('Vui lòng tải lên file Excel dữ liệu.');
      return;
    }

    const mockVoucherId = (type === 'import' ? 'PNK-' : 'PXK-') + Math.floor(Math.random() * 900000 + 100000);

    try {
      // Save voucher
      await http.post('/warehouse/vouchers', {
        voucherId: mockVoucherId,
        date: new Date().toISOString().slice(0, 10),
        warehouse,
        type,
        spCount: mockPreviewRows.length,
        qty: mockPreviewRows.reduce((sum, r) => sum + r.qty, 0),
        totalAmount: mockPreviewRows.reduce((sum, r) => sum + (r.qty * r.price), 0),
        discount: discountType === 'đ' ? discountValue : 0,
        creator: 'Admin',
        note: note || `Nhập kho từ Excel - File: ${selectedFile.name}`,
      });

      // Save imported products list
      for (const row of mockPreviewRows) {
        await http.post('/warehouse/products', {
          id: 'TX-' + Math.floor(Math.random() * 900000 + 100000),
          voucherId: mockVoucherId,
          date: new Date().toISOString().slice(0, 10),
          warehouse,
          productCode: row.code,
          productName: row.name,
          type,
          importQty: type === 'import' ? row.qty : 0,
          exportQty: type === 'export' ? row.qty : 0,
          price: row.price,
          totalAmount: row.qty * row.price,
          creator: 'Admin',
        });
      }

      setSuccess(`Import thành công phiếu ${mockVoucherId} với ${mockPreviewRows.length} sản phẩm!`);
      setTimeout(() => {
        navigate('/warehouse/transactions');
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể thực hiện import dữ liệu.');
    }
  };

  const downloadSampleTemplate = () => {
    // Basic helper to download a template or print message
    alert('Bắt đầu tải file Excel mẫu: mau_import_phieu_xnk.xlsx');
  };

  return (
    <div className="workspace-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div className="page-title-block">
          <div className="page-icon" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <FileUp size={22} />
          </div>
          <div>
            <h1>Import xuất nhập kho</h1>
            <p>Nhập dữ liệu phiếu xuất/nhập kho hàng loạt từ file Excel</p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-light" type="button" onClick={() => navigate('/warehouse/transactions')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="module-grid" style={{ gridTemplateColumns: '380px minmax(0, 1fr)' }}>
        
        {/* Left Form Panel */}
        <form onSubmit={handleSubmit} className="filter-panel" style={{ position: 'static', display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 10px', fontWeight: 800 }}>Thiết lập thông số import</h2>

          <label className="form-field">
            <span>Kiểu *</span>
            <select value={type} onChange={(e) => {
              setType(e.target.value);
              setVoucherType(e.target.value === 'import' ? 'Nhập mua' : 'Xuất bán lẻ');
            }}>
              <option value="import">Nhập kho (Import)</option>
              <option value="export">Xuất kho (Export)</option>
            </select>
          </label>

          <label className="form-field">
            <span>Loại xuất nhập kho *</span>
            {type === 'import' ? (
              <select value={voucherType} onChange={(e) => setVoucherType(e.target.value)}>
                <option value="Nhập mua">Nhập mua (Từ NCC)</option>
                <option value="Nhập hoàn">Nhập hoàn hàng / Trả hàng</option>
                <option value="Nhập chuyển kho">Nhập chuyển kho</option>
                <option value="Nhập khác">Nhập khác</option>
              </select>
            ) : (
              <select value={voucherType} onChange={(e) => setVoucherType(e.target.value)}>
                <option value="Xuất bán lẻ">Xuất bán lẻ / Bán hàng</option>
                <option value="Xuất trả NCC">Xuất trả nhà cung cấp</option>
                <option value="Xuất chuyển kho">Xuất chuyển kho</option>
                <option value="Xuất hủy/hao hụt">Xuất hủy / Hao hụt</option>
              </select>
            )}
          </label>

          <label className="form-field">
            <span>Kiểu xuất nhập kho *</span>
            <select value={voucherSubtype} onChange={(e) => setVoucherSubtype(e.target.value)}>
              <option value="Phiếu thường">Phiếu thường</option>
              <option value="Chuyển kho">Chuyển kho nội bộ</option>
              <option value="Điều chỉnh kiểm kho">Điều chỉnh kiểm kho</option>
            </select>
          </label>

          <label className="form-field">
            <span>Kho hàng *</span>
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
              <option value="Kho chính">Kho chính</option>
              <option value="Kho phụ">Kho phụ</option>
              <option value="Kho hàng LadyStars 1">Kho hàng LadyStars 1</option>
              <option value="Kho tổng">Kho tổng</option>
            </select>
          </label>

          {/* VAT row */}
          <div className="form-field">
            <span>VAT</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select value={vatType} onChange={(e) => setVatType(e.target.value)} style={{ width: '100px', flex: '0 0 100px' }}>
                <option value="%">%</option>
                <option value="đ">Tiền mặt</option>
              </select>
              <input type="number" min={0} value={vatValue} onChange={(e) => setVatValue(Number(e.target.value || 0))} style={{ flex: 1 }} />
            </div>
          </div>

          {/* Discount row */}
          <div className="form-field">
            <span>Chiết khấu</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ width: '100px', flex: '0 0 100px' }}>
                <option value="%">%</option>
                <option value="đ">Tiền mặt</option>
              </select>
              <input type="number" min={0} value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value || 0))} style={{ flex: 1 }} />
            </div>
          </div>

          <label className="form-field">
            <span>Ghi chú</span>
            <textarea rows={2} value={note} placeholder="Ghi chú cho phiếu nhập Excel này" onChange={(e) => setNote(e.target.value)} />
          </label>

          {error && <div className="form-error" style={{ margin: '8px 0 0' }}>{error}</div>}
          {success && <div className="status-badge success" style={{ margin: '8px 0 0', display: 'block', padding: '10px' }}>{success}</div>}

          <button className="btn btn-primary full" type="submit" style={{ marginTop: '10px' }} disabled={!selectedFile}>
            Thực hiện import
          </button>
        </form>

        {/* Right Upload Panel & Preview */}
        <div className="page-stack">
          <div className="data-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Tải lên file Excel mẫu</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                  Vui lòng tải xuống file Excel mẫu và nhập đúng thông tin cột để đảm bảo import thành công.
                </p>
              </div>
              <button className="btn btn-light" type="button" onClick={downloadSampleTemplate}>
                <Download size={16} /> Tải file Excel mẫu
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: isDragActive ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: isDragActive ? 'var(--primary-soft)' : 'var(--border-soft)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <input 
                type="file" 
                id="excel-file-input" 
                accept=".xlsx,.xls" 
                onChange={handleFileInput} 
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }} 
              />
              
              {!selectedFile ? (
                <>
                  <FileSpreadsheet size={48} style={{ color: 'var(--muted)', margin: '0 auto 16px', display: 'block' }} />
                  <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '15px' }}>Kéo thả file Excel của bạn vào đây</p>
                  <p style={{ color: 'var(--muted)', margin: '0 0 16px', fontSize: '13px' }}>Hoặc nhấp vào để duyệt file từ máy tính</p>
                  <span style={{ fontSize: '11px', backgroundColor: 'var(--surface)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                    Chấp nhận .xlsx và .xls
                  </span>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '15px', color: 'var(--success)' }}>
                    File đã sẵn sàng: {selectedFile.name}
                  </p>
                  <p style={{ color: 'var(--muted)', margin: '0 0 16px', fontSize: '13px' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB - Tiến độ: {uploadProgress}%
                  </p>
                  {uploadProgress < 100 ? (
                    <div style={{ width: '200px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden', margin: '0 auto' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.1s ease' }} />
                    </div>
                  ) : (
                    <button className="btn btn-light danger" type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }} style={{ minHeight: '32px', fontSize: '12px' }}>
                      <Trash2 size={14} /> Xóa file
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Parsed Preview Table */}
          {mockPreviewRows.length > 0 && (
            <div className="data-card">
              <div className="data-card-header">
                <h2>Xem trước dữ liệu dòng import ({mockPreviewRows.length} sản phẩm)</h2>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Mã sản phẩm</th>
                      <th>Tên sản phẩm</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Số lượng</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Giá dự kiến</th>
                      <th style={{ width: '180px', textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPreviewRows.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{row.code}</strong></td>
                        <td>{row.name}</td>
                        <td style={{ textAlign: 'right' }}>{row.qty.toLocaleString('vi-VN')}</td>
                        <td style={{ textAlign: 'right' }}>{row.price.toLocaleString('vi-VN')} đ</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {(row.qty * row.price).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800 }}>
                      <td colSpan={3} style={{ textAlign: 'right' }}>Tổng cộng:</td>
                      <td style={{ textAlign: 'right' }}>
                        {mockPreviewRows.reduce((sum, r) => sum + r.qty, 0).toLocaleString('vi-VN')}
                      </td>
                      <td></td>
                      <td style={{ textAlign: 'right', color: 'var(--primary)' }}>
                        {mockPreviewRows.reduce((sum, r) => sum + (r.qty * r.price), 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
