# SKILL.md — LadyStars ERP · Antigravity Agent

> **Tech Stack:** React + TypeScript (client/src) · Node.js API :4000 (server/src) · MongoDB Atlas
> **Áp dụng cho:** Mọi tác vụ vibe code, sửa lỗi, tính năng mới.

---

## ★ QUY TẮC VÀNG (ĐỌC TRƯỚC KHI LÀM GÌ)

**1. Suy nghĩ trước, code sau** — Nêu rõ giả định. Nếu mơ hồ → hỏi, không tự suy đoán.
**2. Tối thiểu code** — Viết đúng thứ được yêu cầu. Không thêm tính năng "phòng xa".
**3. Chỉ chạm vào đúng chỗ cần** — Không "cải tiện" code xung quanh, không refactor ngoài phạm vi.
**4. Thực thi có tiêu chí xác minh** — Mỗi bước phải có cách kiểm tra cụ thể.

---

## PHASE 1 — LẬP KẾ HOẠCH *(Dùng model mạnh: Gemini Pro / Claude Opus)*

> Mục tiêu: Phân tích kỹ, tạo plan đủ chi tiết để Flash thực thi KHÔNG cần suy luận thêm.

### Bước 1 · Thu thập ngữ cảnh
- Đọc các file liên quan trực tiếp đến yêu cầu.
- Kiểm tra file phụ thuộc: routes, models, imports, CSS.
- File `.html` đính kèm → phân tích cấu trúc bảng/cột.
- File `.csv` đính kèm → xác định header, kiểu dữ liệu, mapping schema.
- **Nếu thiếu thông tin → hỏi user, không tự giả định.**

### Bước 2 · Tạo bản kế hoạch (`implementation_plan.md`)
Bắt buộc bao gồm:
- Danh sách file: tạo mới / sửa / xóa.
- **Code hoàn chỉnh** cho từng file — không viết tắt, không `// ...`.
- Thứ tự thực thi từng bước tuần tự.
- Lệnh terminal cần chạy (VD: `npx tsc --noEmit`).
- **Checklist nhiệm vụ `[ ]`** ở cuối để Flash đánh dấu tiến độ.
- Request feedback từ user trước khi kết thúc pha này.

**⛔ TUYỆT ĐỐI không sửa code dự án trong Phase 1. Chỉ đọc + lập kế hoạch.**

---

## PHASE 2 — THỰC THI *(Dùng model nhanh: Gemini Flash)*

> Mục tiêu: Thực thi nhanh, chính xác, tiết kiệm token tối đa.

### Bước 3 · Thực thi kế hoạch
- Đọc `implementation_plan.md` đã được user approve.
- Sao chép nguyên vẹn code từ plan vào file tương ứng.
- Viết chuẩn TypeScript, tự import đúng dependency.
- **Giữ nguyên 100% cấu trúc code cũ** — chỉ thay phần được chỉ định.
- Không tự "tối ưu hóa" hay viết lại ngoài phạm vi plan.

### Bước 4 · Tự kiểm tra & Sửa lỗi
- Theo dõi Terminal `npm run dev` — nếu crash → đọc log → tự sửa.
- **Không hỏi user khi chưa thử tự sửa ít nhất 2 lần.**
- Chạy `npx tsc --noEmit` (client + server) trước khi bàn giao.
- Đánh dấu `[x]` vào Checklist sau mỗi mục hoàn thành.

### Nguyên tắc tiết kiệm token (Flash)
- Không giải thích lý thuyết — đi thẳng vào hành động.
- Không đọc file ngoài phạm vi `implementation_plan.md`.
- Trả lời súc tích, tập trung kết quả.

---

## 4 NGUYÊN TẮC KARPATHY (Nhúng vào mọi quyết định)

### K1 · Suy nghĩ trước khi code
- Nêu giả định tường minh trước khi implement.
- Nhiều cách giải thích → trình bày, không tự chọn im lặng.
- Cách đơn giản hơn tồn tại → nói ra, đề xuất.
- Không rõ → DỪNG. Đặt tên điều chưa rõ. Hỏi.

### K2 · Tối giản trước tiên
- Không có tính năng nào ngoài yêu cầu.
- Không abstract hóa code chỉ dùng 1 lần.
- Không "linh hoạt" / "có thể cấu hình" nếu không được yêu cầu.
- 200 dòng mà có thể viết 50 → viết lại thành 50.
- **Tự hỏi:** *"Senior engineer sẽ nói đây là overcomplicated không?"* Nếu có → đơn giản hóa.

### K3 · Thay đổi phẫu thuật
- Không "cải tiện" code kề bên, comment, hay format.
- Không refactor những thứ không hỏng.
- Khớp style hiện có, dù bạn làm khác đi.
- Phát hiện dead code không liên quan → mention, không xóa.
- Xóa import/variable do THAY ĐỔI CỦA BẠN tạo ra và không còn dùng.
- **Kiểm tra:** Mỗi dòng thay đổi phải trace trực tiếp về yêu cầu của user.

### K4 · Thực thi theo mục tiêu
- Biến task thành tiêu chí xác minh được:
  - "Sửa lỗi" → "Xác nhận lỗi tái hiện được → sửa → xác nhận không còn lỗi"
  - "Thêm tính năng" → "Định nghĩa input/output mong đợi → implement → verify"
- Task nhiều bước → nêu plan ngắn:
  ```
  1. [Bước] → verify: [kiểm tra gì]
  2. [Bước] → verify: [kiểm tra gì]
  ```

---

## UI · DESIGN PRINCIPLES (Vibe Coding UI)

Khi tạo/sửa giao diện, agent PHẢI tuân theo design system hiện có của LadyStars:
- **Không tự ý đổi màu sắc, font, spacing** so với các component đang có.
- Tham chiếu component hiện có trong `client/src/core/components/` trước khi tạo mới.
- UI mới phải visual-consistent với toàn bộ app (kiểm tra các page tương tự).
- Ưu tiên reuse component có sẵn; tạo mới chỉ khi không có gì phù hợp.
- Mọi table, form, modal → dùng pattern đang dùng trong codebase.

---

## BẢNG THAM CHIẾU NHANH

| Tình huống | Hành động |
|---|---|
| Yêu cầu mơ hồ | Hỏi trước, không tự giả định |
| Muốn thêm tính năng "hay" không được yêu cầu | KHÔNG làm |
| Thấy code lỗi không liên quan | Mention, không sửa |
| Crash sau thay đổi | Tự sửa 2 lần trước khi hỏi |
| Không biết dùng component nào | Tìm trong `core/components/` trước |
| Tạo UI mới | Xem page tương tự, khớp style |

---

## WORKFLOW NGƯỜI DÙNG

| Bước | Hành động | Model |
|---|---|---|
| 1 | Gửi yêu cầu | **Gemini Pro** hoặc **Claude Opus** |
| 2 | Review & Approve plan | *(user)* |
| 3 | "Thực thi kế hoạch" | **Gemini Flash** |
| 4 | Kiểm tra trên trình duyệt | *(user)* |