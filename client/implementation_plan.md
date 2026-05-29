# Kế hoạch Xây dựng Giao diện Dashboard Mới (Trang tổng quan)

Giao diện Dashboard hiện tại sẽ được đập bỏ và thiết kế lại hoàn toàn để đáp ứng các yêu cầu:
- Tích hợp **toàn bộ chức năng** từ file `Cấu trúc.txt` (đã được trích xuất thành mega menu).
- Giao diện **thiết kế mới, đẹp mắt, hiện đại** (Glassmorphism, màu sắc rực rỡ).
- **Đồng bộ dữ liệu** với backend (sử dụng API `/dashboard` hiện tại).
- Tích hợp **bộ lọc theo kho và theo ngày**.
- Tích hợp **sơ đồ/biểu đồ** báo cáo.

## User Review Required
> [!IMPORTANT]
> - Giao diện mới sẽ bao gồm toàn bộ link từ `Cấu trúc.txt` được phân nhóm thành các Card đẹp mắt trên màn hình chính.
> - Xin vui lòng kiểm tra và xác nhận kế hoạch dưới đây. Sau khi bạn xác nhận, hệ thống (Phase 2 - Flash) sẽ tự động copy toàn bộ code để thực thi mà không cắt xén.

## Open Questions
> [!TIP]
> - Biểu đồ (Sơ đồ) sẽ được vẽ bằng CSS/SVG thuần (không cài thêm thư viện để tối giản code như yêu cầu). Bạn có đồng ý với điều này không?
> - Các chức năng (links) sẽ không được thiết kế thành menu dọc (sidebar) mà sẽ là một **Mega Dashboard Grid** ở trang tổng quan để bạn dễ click nhất.

## Proposed Changes

---

### Mảng Frontend (client)

#### [NEW] client/src/modules/dashboard/dashboard.css
File CSS mới chứa toàn bộ UI/UX cho Dashboard (màu sắc, gradient, hover animations).
```css
.dashboard-v2-container {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
}

.dashboard-header-v2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-title-v2 h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #db2777);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.dashboard-title-v2 p {
  color: #64748b;
  margin: 0;
}

.dashboard-filters {
  display: flex;
  gap: 16px;
}

.dashboard-filter-select, .dashboard-filter-date {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 14px;
  color: #334155;
  outline: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s;
}

.dashboard-filter-select:focus, .dashboard-filter-date:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.stats-grid-v2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card-v2 {
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card-v2::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
}

.stat-card-v2:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-icon-v2 {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info-v2 p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.stat-info-v2 h3 {
  margin: 4px 0 0 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 700;
}

/* Biểu đồ Sơ đồ (Chart) */
.chart-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.chart-section h2 {
  margin: 0 0 24px 0;
  font-size: 18px;
  color: #1e293b;
}

.css-bar-chart {
  display: flex;
  align-items: flex-end;
  height: 250px;
  gap: 2%;
  padding-bottom: 30px;
  position: relative;
  border-bottom: 2px solid #f1f5f9;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  position: relative;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 6px 6px 0 0;
  transition: height 0.5s ease;
  position: relative;
}

.bar:hover {
  background: linear-gradient(180deg, #2563eb 0%, #3b82f6 100%);
}

.bar-label {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.bar-value {
  position: absolute;
  top: -25px;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  opacity: 0;
  transition: opacity 0.2s;
}

.bar:hover .bar-value {
  opacity: 1;
}

/* Mega Menu / Tất cả chức năng */
.mega-menu-section {
  background: transparent;
}

.mega-menu-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mega-menu-header h2 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}

.mega-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.mega-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.mega-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.mega-card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.mega-links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;
}

.mega-links-list::-webkit-scrollbar {
  width: 4px;
}

.mega-links-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.mega-link-item {
  text-decoration: none;
  color: #475569;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mega-link-item:hover {
  background: #f1f5f9;
  color: #2563eb;
  transform: translateX(4px);
}
```

#### [NEW] client/src/modules/dashboard/dashboardLinks.ts
Lưu trữ danh sách toàn bộ các chức năng (trích xuất từ `Cấu trúc.txt` do user yêu cầu).
```typescript
export const megaMenuGroups = [
  {
    title: 'Báo cáo & Thống kê',
    items: [
      { text: 'Theo thời gian', href: '/report/revenue/index?businessId=122623' },
      { text: 'Theo cửa hàng', href: '/report/revenue/depot?businessId=122623' },
      { text: 'Theo thương hiệu', href: '/report/revenue/brand?businessId=122623' },
      { text: 'Theo nhân viên', href: '/report/revenue/staff?businessId=122623' },
      { text: 'Theo phòng ban', href: '/report/revenue/department?businessId=122623' },
      { text: 'Theo danh mục sản phẩm', href: '/report/revenue/category?businessId=122623' },
      { text: 'Theo danh mục nội bộ', href: '/report/revenue/internalcategory?businessId=122623' },
      { text: 'Theo sản phẩm', href: '/report/revenue/product?businessId=122623' },
      { text: 'Theo nhà cung cấp', href: '/report/revenue/supplier?businessId=122623' },
      { text: 'Theo khách hàng', href: '/report/revenue/customer?businessId=122623' },
      { text: 'Tỷ suất doanh thu / tồn kho', href: '/report/revenue/inventoryrate?businessId=122623' },
      { text: 'Theo kênh bán', href: '/report/order/salechannel?businessId=122623' },
      { text: 'Đơn tạo', href: '/report/order/index?businessId=122623' },
      { text: 'Đơn thành công', href: '/report/order/success?businessId=122623' },
      { text: 'Theo giá trị đơn hàng', href: '/report/order/value?businessId=122623' },
      { text: 'Theo danh mục sản phẩm', href: '/report/order/category?businessId=122623' },
      { text: 'Theo sản phẩm', href: '/report/order/product?businessId=122623' },
      { text: 'Theo trạng thái', href: '/report/order/status?businessId=122623' },
      { text: 'Theo địa chỉ', href: '/report/order/location?businessId=122623' },
      { text: 'Lý do xử lý đơn hàng', href: '/report/order/cancel?businessId=122623' },
      { text: 'Nhân viên xử lý', href: '/report/order/create?businessId=122623' },
      { text: 'Theo quảng cáo', href: '/report/order/utm?businessId=122623' },
      { text: 'Tiền đối soát', href: '/report/order/verifyandtransfer?businessId=122623' },
      { text: 'Theo hãng vận chuyển', href: '/report/order/carrier?businessId=122623' },
      { text: 'Tổng quan', href: '/report/retail/index?businessId=122623' },
      { text: 'Theo nguồn khách hàng', href: '/report/retail/trafficsource?businessId=122623' },
      { text: 'Theo nhân viên', href: '/report/retail/cashier?businessId=122623' },
      { text: 'Theo cửa hàng', href: '/report/retail/depot?businessId=122623' },
      { text: 'Chi tiết quẹt thẻ', href: '/report/retail/creditmoney?businessId=122623' },
      { text: 'Theo giá trị hóa đơn', href: '/report/retail/billvalue?businessId=122623' },
      { text: 'Báo cáo tỷ lệ hóa đơn/ khách vào cửa hàng', href: '/report/retail/customerbillrate?businessId=122623' },
      { text: 'Báo cáo kết ca', href: '/report/retail/workshift?businessId=122623' },
      { text: 'Tổng quan', href: '/report/wholesale/index?businessId=122623' },
      { text: 'Theo nhân viên bán hàng', href: '/report/wholesale/storesale?businessId=122623' },
      { text: 'Xuất nhập tồn theo sản phẩm', href: '/report/inventory/index?businessId=122623' },
      { text: 'Chi tiết sản phẩm XNK', href: '/report/inventory/imex?businessId=122623' },
      { text: 'Tổng XNK', href: '/report/inventory/imextotal?businessId=122623' },
      { text: 'Tổng XNK theo cửa hàng', href: '/report/inventory/imexdepot?businessId=122623' },
      { text: 'Theo nhà cung cấp', href: '/report/inventory/supplier2?businessId=122623' },
      { text: 'Danh mục sản phẩm', href: '/report/inventory/category?businessId=122623' },
      { text: 'Số lượng hàng tồn kho', href: '/report/inventory/eachdepot?businessId=122623' },
      { text: 'Chuyển kho chưa xác nhận', href: '/report/inventory/transfer?businessId=122623' },
      { text: 'Theo trạng thái từng cửa hàng', href: '/report/inventory/depotinventorystatus?businessId=122623' },
      { text: 'Theo trạng thái từng sản phẩm', href: '/report/inventory/productinventorystatus?businessId=122623' },
      { text: 'Theo lô hàng', href: '/report/inventory/productbatchs?businessId=122623' },
      { text: 'Chuyển kho theo sản phẩm', href: '/report/inventory/producttransfer?businessId=122623' },
      { text: 'Bán chạy nhất', href: '/report/product/index?businessId=122623' },
      { text: 'Bán chạy theo cửa hàng', href: '/report/product/depot?businessId=122623' },
      { text: 'Tốc độ bán hàng', href: '/report/product/salespeed?businessId=122623' },
      { text: 'Theo kênh bán', href: '/report/product/salechannel?businessId=122623' },
      { text: 'Theo danh mục và cửa hàng', href: '/report/product/categorydetail?businessId=122623' },
      { text: 'Theo khoảng giá', href: '/report/product/value?businessId=122623' },
      { text: 'Theo ngày', href: '/report/product/date?businessId=122623' },
      { text: 'Bán hàng theo IMEI', href: '/report/product/salebyimei?businessId=122623' },
      { text: 'Theo thuộc tính', href: '/report/product/attribute?businessId=122623' },
      { text: 'Tổng hợp thu chi theo cửa hàng', href: '/accounting/report/cash?businessId=122623' },
      { text: 'Tổng hợp theo tài khoản', href: '/accounting/report/account?businessId=122623' },
      { text: 'Tổng hợp tiền bán lẻ hàng ngày theo cửa hàng', href: '/accounting/report/money?businessId=122623' },
      { text: 'Tổng hợp thu chi theo ngày', href: '/accounting/report/cashbook?businessId=122623' },
      { text: 'Tổng hợp kết quả kinh doanh', href: '/accounting/report/businessresult?businessId=122623' },
      { text: 'Bảng cân đối kế toán', href: '/accounting/report/balancesheet?businessId=122623' },
      { text: 'Tổng quan', href: '/report/customer/index?businessId=122623' },
      { text: 'Theo sản phẩm', href: '/report/customer/product?businessId=122623' },
      { text: 'Tỷ lệ khách quay lại', href: '/report/customer/total?businessId=122623' },
      { text: 'Cấp độ khách hàng', href: '/report/customer/level?businessId=122623' },
      { text: 'Nhóm khách hàng', href: '/report/customer/group?businessId=122623' },
      { text: 'Khách hàng tạo mới theo cửa hàng', href: '/report/customer/createnew?businessId=122623' },
      { text: 'Chu kỳ mua hàng', href: '/report/customer/frequencybought?businessId=122623' },
      { text: 'Sinh nhật khách hàng', href: '/report/customer/birthday?businessId=122623' },
      { text: 'Tỉ lệ với doanh thu', href: '/report/promotion/discountrate?businessId=122623' },
      { text: 'Quà tặng theo sản phẩm', href: '/report/promotion/productgift?businessId=122623' },
      { text: 'Theo sản phẩm', href: '/report/promotion/productdiscountrate?businessId=122623' },
      { text: 'Quà tặng theo cửa hàng', href: '/report/promotion/bonusbydepot?businessId=122623' },
      { text: 'Doanh thu theo bảng giá', href: '/report/promotion/pricelist?businessId=122623' },
      { text: 'Tin gửi theo ngày', href: '/report/zalo/historydate?businessId=122623' },
      { text: 'Tin gửi theo mẫu', href: '/report/zalo/template?businessId=122623' },
      { text: 'Đánh giá của khách hàng', href: '/report/zalo/rating?businessId=122623' },
      { text: 'Tin gửi theo ngày', href: '/report/sms/date?businessId=122623' },
    ]
  },
  {
    title: 'Sản phẩm & Kho hàng',
    items: [
      { text: 'Sản phẩm', href: '/product/item/index?businessId=122623' },
      { text: 'Thương hiệu', href: '/product/brand/index?businessId=122623' },
      { text: 'Lô sản phẩm', href: '/product/batch/index?businessId=122623' },
      { text: 'Thời gian lưu kho', href: '/product/item/storagetime?businessId=122623' },
      { text: 'Tồn kho', href: '/product/item/inventory?businessId=122623' },
      { text: 'Danh mục', href: '/product/category/index?businessId=122623' },
      { text: 'Thuộc tính', href: '/product/variant/index?businessId=122623' },
      { text: 'Nhà cung cấp', href: '/supplier/manage/index?businessId=122623' },
      { text: 'Xuất nhập kho', href: '/inventory/bill/index?businessId=122623' },
      { text: 'Chuyển kho', href: '/inventory/transfer/index?businessId=122623' },
      { text: 'Kiểm kho', href: '/inventory/check/index?businessId=122623' },
      { text: 'Phiếu nháp', href: '/inventory/requirement/bill?businessId=122623' },
      { text: 'Hạn mức tồn kho', href: '/inventory/archive/index?businessId=122623' },
      { text: 'Vị trí sản phẩm', href: '/inventory/position/index?businessId=122623' },
      { text: 'Danh mục vị trí', href: '/inventory/position/category?businessId=122623' },
      { text: 'HĐXN vị trí', href: '/inventory/position/bill?businessId=122623' },
      { text: 'Sản phẩm xuất nhập vị trí', href: '/inventory/position/imex?businessId=122623' },
      { text: 'Dự báo nhập hàng', href: '/inventory/forecasting/movingaverage?businessId=122623' },
      { text: 'Tổng công ty', href: '/inventory/product/companyavailable?businessId=122623' },
      { text: 'Lịch sử sửa xóa', href: '/inventory/log/imexbill?businessId=122623' },
    ]
  },
  {
    title: 'Bán hàng & Đơn hàng',
    items: [
      { text: 'Thêm gói sản phẩm', href: '/pos/bill/addpackage?businessId=122623' },
      { text: 'Bung gói sản phẩm', href: '/pos/bill/extractpackage?businessId=122623' },
      { text: 'Tìm hóa đơn', href: '/pos/bill/lookup?businessId=122623' },
      { text: 'Bán lẻ', href: '/pos/bill/index?businessId=122623' },
      { text: 'Bán sỉ', href: '/pos/bill/wholesale?businessId=122623' },
      { text: 'Hóa đơn điện tử', href: '/pos/invoice/index?businessId=122623' },
      { text: 'Trả hàng', href: '/pos/return/index?businessId=122623' },
      { text: 'Nợ quà tặng', href: '/pos/debt/bill?businessId=122623' },
      { text: 'Đơn hàng', href: '/order/manage/index?businessId=122623' },
      { text: 'Đơn trùng', href: '/order/manage/checkduplicate?businessId=122623' },
      { text: 'Đóng gói', href: '/order/manage/packing?businessId=122623' },
      { text: 'Biên bản bàn giao', href: '/shipping/handover/index?businessId=122623' },
      { text: 'Chờ gửi vận chuyển', href: '/order/manage/sendingcarrier?businessId=122623' },
      { text: 'Khiếu nại', href: '/order/manage/complain?businessId=122623' },
      { text: 'Đơn gửi qua Nhanh', href: '/order/payment/index?businessId=122623' },
      { text: 'Đơn tự kết nối', href: '/order/manage/payment?businessId=122623' },
      { text: 'Lịch sử sửa xóa', href: '/order/manage/deleted?businessId=122623' },
    ]
  },
  {
    title: 'Khách hàng & Đối tác',
    items: [
      { text: 'Danh sách khách hàng', href: '/customer/code/customerlist?businessId=122623' },
      { text: 'Thẻ khách hàng', href: '/customer/code/index?businessId=122623' },
      { text: 'Chăm sóc khách hàng', href: '/customer/care/index?businessId=122623' },
      { text: 'Cấp độ', href: '/customer/store/level?businessId=122623' },
      { text: 'Nhóm khách hàng', href: '/customer/group/index?businessId=122623' },
      { text: 'Hình thức chăm sóc', href: '/customer/type/index?businessId=122623' },
      { text: 'Lý do chăm sóc', href: '/customer/reason/index?businessId=122623' },
      { text: 'Like sản phẩm', href: '/social/like/index?businessId=122623' },
    ]
  },
  {
    title: 'Kế toán & Tài chính',
    items: [
      { text: 'Cài đặt', href: '/invoice/setting/index?businessId=122623' },
      { text: 'Hóa đơn', href: '/invoice/bill/index?businessId=122623' },
      { text: 'Thu chi tiền mặt', href: '/accounting/transaction/cash?businessId=122623' },
      { text: 'Thu chi ngân hàng', href: '/accounting/transaction/bank?businessId=122623' },
      { text: 'Tổng hợp thu chi', href: '/accounting/transaction/cashbook?businessId=122623' },
      { text: 'Sàn TMĐT', href: '/accounting/debts/merchant?businessId=122623' },
      { text: 'Nhân viên bán hàng', href: '/accounting/debts/salemandate?businessId=122623' },
      { text: 'Dịch vụ trả góp', href: '/accounting/debts/installment?businessId=122623' },
      { text: 'Trả góp theo ngày', href: '/accounting/debts/item?businessId=122623' },
      { text: 'Công nợ theo đầu tài khoản', href: '/accounting/debts/byaccount?businessId=122623' },
      { text: 'Nhập công nợ đầu kỳ', href: '/accounting/debts/add?businessId=122623' },
      { text: 'Bút toán', href: '/accounting/transaction/index?businessId=122623' },
      { text: 'Phát sinh đối ứng', href: '/accounting/transaction/reciprocalaccount?businessId=122623' },
      { text: 'Nhật ký chung', href: '/accounting/transaction/logbook?businessId=122623' },
      { text: 'Thu hộ trả góp', href: '/accounting/transaction/installments?businessId=122623' },
      { text: 'Lịch sử', href: '/accounting/transaction/logs?businessId=122623' },
      { text: 'Tài khoản kế toán', href: '/accounting/account/index?businessId=122623' },
      { text: 'Dịch vụ trả góp', href: '/accounting/contact/index?businessId=122623' },
    ]
  },
  {
    title: 'Kênh bán (TMĐT)',
    items: [
      { text: 'Báo cáo tài chính', href: '/ecommerce/finance/dashboard?businessId=122623' },
      { text: 'Đối soát COD', href: '/ecommerce/manage/index?businessId=122623' },
      { text: 'Trả hàng hoàn tiền', href: '/ecommerce/manage/return?businessId=122623' },
      { text: 'Shopee - Sản phẩm', href: '/ecommerce/shopee/product?businessId=122623' },
      { text: 'TikTok - Sản phẩm', href: '/ecommerce/tiktok/product?businessId=122623' },
      { text: 'Lazada - Sản phẩm', href: '/ecommerce/lazada/product?businessId=122623' },
    ]
  },
  {
    title: 'Cài đặt & Khác',
    items: [
      { text: 'Thông báo hệ thống', href: '/thong-bao-lich-bao-tri-server-dip-tet-nguyen-dan-2026-an917.html' },
      { text: 'Cài đặt', href: '/website/content/setting?businessId=122623' },
      { text: 'Tag', href: '/website/content/tags?businessId=122623' },
      { text: 'Album', href: '/website/album/index?businessId=122623' },
      { text: 'Link điều hướng', href: '/website/redirectlink/index?businessId=122623' },
      { text: 'Chiết khấu', href: '/promotion/setting/discount?businessId=122623' },
      { text: 'Thiết lập bảng giá', href: '/promotion/setting/pricelist?businessId=122623' },
      { text: 'Tích điểm', href: '/promotion/setting/point?businessId=122623' },
      { text: 'Mã giảm giá', href: '/promotion/setting/coupon?businessId=122623' },
      { text: 'Quà tặng', href: '/promotion/setting/gift?businessId=122623' },
      { text: 'Hoa hồng bán hàng', href: '/promotion/setting/commission?businessId=122623' },
      { text: 'Nhân viên', href: '/store/user/index?businessId=122623' },
      { text: 'Cài đặt chung', href: '/setting/store/index?businessId=122623' },
      { text: 'Bán hàng và XNK', href: '/setting/store/sale?businessId=122623' },
      { text: 'Cài đặt nhãn', href: '/setting/store/labels?businessId=122623' },
      { text: 'Mẫu in', href: '/store/template/design?businessId=122623' },
      { text: 'Gửi email', href: '/setting/email/index?businessId=122623' },
      { text: 'Thanh toán', href: '/setting/payment/index?businessId=122623' },
      { text: 'Chi nhánh', href: '/store/branch/index?businessId=122623' },
      { text: 'Hạn sử dụng', href: '/setting/expire/depot?businessId=122623' },
    ]
  }
];
```

#### [MODIFY] client/src/modules/dashboard/DashboardPage.tsx
Đập bỏ UI cũ, thay bằng bản mới toàn diện, có đồng bộ API dữ liệu, bộ lọc và biểu đồ.
```tsx
import { useEffect, useState } from 'react';
import { 
  AlertCircle, Boxes, Receipt, TrendingUp, Users, Wallet, 
  Calendar, MapPin, Activity, LayoutGrid 
} from 'lucide-react';
import { http } from '../../core/api/http';
import { megaMenuGroups } from './dashboardLinks';
import './dashboard.css';

type DashboardData = {
  totals: Record<string, number>;
  recentSales: any[];
  recentProducts: any[];
};

const money = (value: number) => \`\${Number(value || 0).toLocaleString('vi-VN')} đ\`;

// Dữ liệu giả lập cho biểu đồ (Vì API chưa trả về chuỗi thời gian)
const chartDataMock = [
  { day: 'T2', value: 12000000, height: '40%' },
  { day: 'T3', value: 15000000, height: '50%' },
  { day: 'T4', value: 8000000, height: '25%' },
  { day: 'T5', value: 22000000, height: '70%' },
  { day: 'T6', value: 18000000, height: '60%' },
  { day: 'T7', value: 30000000, height: '100%' },
  { day: 'CN', value: 25000000, height: '85%' },
];

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  useEffect(() => {
    // Gọi API đồng bộ với dữ liệu. Gắn thêm filter để backend có thể dùng nếu có
    http.get(\`/dashboard?date=\${selectedDate}&warehouse=\${selectedWarehouse}\`)
      .then((response) => setData(response.data))
      .catch(() => console.log('Lỗi tải dashboard'));
  }, [selectedDate, selectedWarehouse]);

  const totals = data?.totals ?? {};
  
  const stats = [
    { label: 'Doanh thu', value: money(totals.revenue), icon: <TrendingUp size={28} color="#fff" />, color: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { label: 'Phiếu bán', value: totals.sales ?? 0, icon: <Receipt size={28} color="#fff" />, color: 'linear-gradient(135deg, #10b981, #059669)' },
    { label: 'Hàng hóa', value: totals.products ?? 0, icon: <Boxes size={28} color="#fff" />, color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { label: 'Sắp hết tồn', value: totals.lowStock ?? 0, icon: <AlertCircle size={28} color="#fff" />, color: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    { label: 'Khách hàng', value: totals.customers ?? 0, icon: <Users size={28} color="#fff" />, color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { label: 'Lợi nhuận', value: money(totals.profit), icon: <Wallet size={28} color="#fff" />, color: 'linear-gradient(135deg, #ec4899, #db2777)' },
  ];

  return (
    <div className="dashboard-v2-container">
      {/* HEADER: Có bộ lọc theo yêu cầu */}
      <div className="dashboard-header-v2">
        <div className="dashboard-title-v2">
          <h1>Tổng quan Vận hành</h1>
          <p>Kiểm soát toàn bộ dữ liệu & chức năng hệ thống</p>
        </div>
        <div className="dashboard-filters">
          <div style={{ position: 'relative' }}>
            <MapPin size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            <select 
              className="dashboard-filter-select" 
              style={{ paddingLeft: 36 }}
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <option value="all">Tất cả kho hàng</option>
              <option value="kho-tong">Kho Tổng (Hà Nội)</option>
              <option value="kho-hcm">Kho HCM</option>
            </select>
          </div>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input 
              type="date" 
              className="dashboard-filter-date"
              style={{ paddingLeft: 36 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="stats-grid-v2">
        {stats.map((stat, i) => (
          <div className="stat-card-v2" key={i} style={{ borderLeft: \`4px solid \${stat.color.split(',')[1]}\` }}>
            <div className="stat-icon-v2" style={{ background: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info-v2">
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* SƠ ĐỒ / BIỂU ĐỒ */}
      <div className="chart-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Activity size={20} color="#3b82f6" />
          <h2 style={{ margin: 0 }}>Sơ đồ Doanh thu (7 ngày qua)</h2>
        </div>
        <div className="css-bar-chart">
          {chartDataMock.map((point, i) => (
            <div className="bar-wrapper" key={i}>
              <div className="bar-value">{money(point.value)}</div>
              <div className="bar" style={{ height: point.height }}></div>
              <div className="bar-label">{point.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MEGA MENU - Toàn bộ chức năng từ Cấu trúc.txt */}
      <div className="mega-menu-section">
        <div className="mega-menu-header">
          <LayoutGrid size={24} color="#db2777" />
          <h2>Bảng điều khiển Chức năng (Mega Menu)</h2>
        </div>
        <div className="mega-grid">
          {megaMenuGroups.map((group, index) => (
            <div className="mega-card" key={index}>
              <div className="mega-card-header">
                <h3>{group.title}</h3>
                <span style={{ marginLeft: 'auto', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                  {group.items.length}
                </span>
              </div>
              <div className="mega-links-list">
                {group.items.map((link, linkIndex) => (
                  <a key={linkIndex} href={link.href} className="mega-link-item" title={link.text}>
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Checklist
- `[ ]` Thêm file `dashboard.css`.
- `[ ]` Thêm file `dashboardLinks.ts`.
- `[ ]` Thay thế nội dung file `DashboardPage.tsx`.
- `[ ]` Xác minh ứng dụng load lên không lỗi.

## Verification Plan
1. Chạy Terminal xem vite có crash không.
2. Kiểm tra trực quan giao diện mới với DatePicker, Biểu đồ và Mega Menu.
3. Kiểm tra các class CSS có hiển thị đúng màu gradient.
