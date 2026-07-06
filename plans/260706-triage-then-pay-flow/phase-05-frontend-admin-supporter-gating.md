# Phase 05: Frontend — Admin & Supporter Gating

**Status:** `[pending]`
**Depends on:** Phase 01-04
**Blocks:** Phase 06

## Overview

Phát triển phía giao diện Admin: triage accept kèm đề xuất package mới, bổ sung cột trạng thái thanh toán (`payment_status`) mới, xây dựng giao diện xử lý hoàn tiền (refund). Phía giao diện Supporter: thực hiện hard-gate chặn xử lý chuyên môn khi hồ sơ chưa hoàn tất thanh toán.

## Tasks

### 1. Admin triage — accept kèm đề xuất package

**File:** `app/admin/...` (triage panel) + hook gọi API `POST /api/admin/cases/:id/accept`
- Form accept: tích hợp thêm phần chọn (select) "Đề xuất gói khác" (lấy danh sách packages đang active) + vùng nhập (textarea) lý do thay đổi.
- Gửi kèm dữ liệu `proposed_package_id` và `package_change_reason` khi admin chọn đổi gói.
- Sau khi accept: hồ sơ biến mất khỏi danh sách hàng đợi duyệt sơ bộ (chuyển trạng thái sang `triage_accepted`).

### 2. Admin — cột payment_status & duyệt minh chứng

**File:** admin cases table + payment verification table
- Hiển thị thêm cột `payment_status` với các nhãn mới (sử dụng `statusThemeMap`).
- Duyệt thanh toán: giữ các hành động paid/reject; đảm bảo hiển thị đúng trạng thái `proof_submitted` (được đổi từ `pending_verification`).
- Bổ sung bộ lọc danh sách "chờ thanh toán" (awaiting_confirmation/pending/proof_submitted/expired).

### 3. Admin — xử lý yêu cầu hoàn tiền (refund)

**File mới:** `app/admin/refunds/...` (hoặc tab riêng trong phân hệ admin)
- Bảng danh sách lấy từ API `GET /api/admin/refunds`: hiển thị mã hồ sơ (case_code), số tiền (amount), phân loại tầng hoàn tiền (tier), trạng thái (status), ngày yêu cầu (requested_at).
- Các hành động thông qua API `POST /api/admin/refunds/:id/process`: duyệt (approve) / hoàn tất chuyển khoản (complete) / từ chối (reject - yêu cầu nhập lý do).
- Hiển thị thông tin nội dung quy định hoàn tiền 3 tầng tại màn hình để admin tiện đối chiếu.

### 4. Admin — quét hết hạn thanh toán thủ công

- Thiết kế nút "Hết hạn overdue" gọi API `expireOverduePayments` (hoặc tự động kích hoạt ngầm khi load danh sách). Hiển thị số lượng hồ sơ đã bị đánh dấu hết hạn trong đợt quét.

### 5. Supporter — hard gate chặn thao tác chuyên môn

**Files:** `app/supporter/case/[id]/page.tsx`, `app/supporter/case/[id]/review/page.tsx`
- Nếu kiểm tra thấy `!isPaymentSatisfied` (chưa thanh toán / không được miễn phí) → ẩn hoặc khóa (disable) toàn bộ khu vực làm việc chuyên môn (tạo/sửa/xuất bản report) tại trang chi tiết, đồng thời chặn truy cập (hoặc redirect về trang chi tiết kèm alert cảnh báo) tại trang review báo cáo: "Hồ sơ chưa thanh toán — không thể xử lý chuyên môn."
- Chuyển đổi các logic đang sử dụng `caseRequiresPayment` cũ → sang kiểm tra phủ định của `isPaymentSatisfied`.
- Tab thiết lập (settings): ẩn hành động yêu cầu xử lý chuyên môn.


### 6. Admin phân công supporter

**File:** admin case detail (phần phân công supporter)
- Khóa (disable) nút phân công supporter khi `!isPaymentSatisfied`; bổ sung tooltip hiển thị "Cần thanh toán trước khi phân công chuyên gia."

## Acceptance criteria

- [ ] Admin thực hiện duyệt sơ bộ kèm đề xuất gói dịch vụ mới → API nhận đúng tham số; hồ sơ chuyển sang trạng thái `triage_accepted`
- [ ] Cột `payment_status` tại bảng admin hiển thị đúng nhãn mới; các bộ lọc hoạt động chính xác
- [ ] Trang quản lý hoàn tiền và các hành động (approve/complete/reject) hoạt động bình thường
- [ ] Supporter không thể tạo, chỉnh sửa hoặc xuất bản report khi hồ sơ chưa được thanh toán đầy đủ
- [ ] Không cho phép phân công supporter khi hồ sơ chưa thanh toán
- [ ] `check-types` chạy thành công không có lỗi type