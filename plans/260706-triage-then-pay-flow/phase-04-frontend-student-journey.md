# Phase 04: Frontend — Student Payment Journey

**Status:** `[pending]`
**Depends on:** Phase 01, Phase 02, Phase 03 (API sẵn sàng)
**Blocks:** Phase 06

## Overview

Phát triển phía giao diện Student: hiển thị đúng trạng thái mới, thêm bước xác nhận package/giá, chặn/hiển thị CTA thanh toán theo `pending/rejected`, hiển thị thông báo hết hạn + kích hoạt lại (reactivate), nút yêu cầu hoàn tiền (refund request), và chặn anti-spam tại trang gửi hồ sơ (submit-case). Bám sát các thông tin mô tả tại §7 tài liệu report và quy định Mantine (không dùng class định vị thủ công).

## Tasks

### 1. Types & theme

**File:** `apps/web-1/types/case.ts`
- Bổ sung `payment_status` union mới: `not_required | awaiting_confirmation | pending | proof_submitted | expired | refunded` (giữ nguyên các trạng thái cũ `unpaid | paid | rejected`).
- Thêm `triage_accepted` vào `user_facing_stage`.
- Thêm các thuộc tính mới: `triage_accepted_at`, `package_confirmed_at`, `payment_window_expires_at`, `expired_at`, `proposed_package_id`, `proposed_locked_price`, `package_change_reason`.

Cập nhật `statusThemeMap` trong `apps/web-1/types/case.ts` để hiển thị:
```typescript
triage_accepted: { label: "Đã tiếp nhận — chờ xác nhận gói", color: "primary" }
awaiting_confirmation: { label: "Chờ xác nhận gói dịch vụ", color: "warning" }
pending: { label: "Chờ thanh toán", color: "warning" }
proof_submitted: { label: "Đang xác minh thanh toán", color: "primary" }
expired: { label: "Hết hạn thanh toán", color: "danger" }
refunded: { label: "Đã hoàn tiền", color: "default" }
not_required: { label: "Miễn phí", color: "success" }
```

### 2. Pricing helpers

**File:** `apps/web-1/lib/pricing.ts`
- `caseRequiresPayment`: `price > 0 && !['paid','not_required','refunded'].includes(payment_status)`.
- `canConfirmPackage(case)`: `payment_status === 'awaiting_confirmation'`.
- `canUploadProof(case)`: `payment_status === 'pending' || payment_status === 'rejected'`.
- `isPaymentExpired(case)`: `payment_status === 'expired'`.
- `canReactivatePayment(case)`: `expired` và `expired_at` vẫn nằm trong vòng 7 ngày.
- `paymentWindowRemaining(case)`: Trả về khoảng thời gian còn lại (`payment_window_expires_at - now` bằng ms) khi trạng thái là pending/proof_submitted.
- `canRequestRefund(case)`: `payment_status === 'paid' && !assigned_supporter_auth_user_id`.
- `isPaymentSatisfied(case)`: `['paid','not_required'].includes(payment_status)`.

### 3. PackageConfirmationCard (mới)

**File:** `apps/web-1/app/dashboard/case/[id]/_components/PackageConfirmationCard.tsx`
- Chỉ render khi `canConfirmPackage`.
- Giao diện bám sát tài liệu §7: nếu có `proposed_package_id` khác biệt → hiển thị thông tin gói mới + giá tiền + lý do thay đổi (`package_change_reason`) + nút "Xác nhận gói đề xuất" và nút "Giữ gói gốc". Nếu không có sự thay đổi gói → chỉ hiện thông tin gói + giá + nút "Xác nhận gói dịch vụ".
- Gọi API `POST /api/payments/cases/:id/confirm-package` truyền `{ acceptProposed }`. Sử dụng TanStack Query mutation; invalidate case detail sau khi thành công.
- Tạo hook `useConfirmPackage` mới.

### 4. Gating các CTA thanh toán

**File:** `app/dashboard/case/[id]/page.tsx` + `_components/UnpaidAlertBanner.tsx`
- Chỉ hiển thị banner hoặc nút CTA thanh toán khi `canUploadProof` (trạng thái pending/rejected).
- Khi trạng thái là `awaiting_confirmation` → hiển thị component `PackageConfirmationCard` thay vì banner thanh toán.
- Khi trạng thái là `expired` → hiển thị component `ExpiredPaymentNotice`.
- Khi trạng thái là `proof_submitted` → hiển thị thông báo "Minh chứng đã gửi — đang xác minh (trong vòng 4 giờ làm việc)".

**File:** `_components/PaymentDrawer.tsx` + `payment/page.tsx`
- Chỉ cho phép mở khi thỏa mãn `canUploadProof`. Hiển thị đồng hồ đếm ngược 72h (`paymentWindowRemaining`). Hiển thị chính sách hủy hồ sơ (tier-1 hoàn tiền 100% khi chưa phân công supporter).

### 5. ExpiredPaymentNotice (mới)

**File:** `_components/ExpiredPaymentNotice.tsx`
- Nếu thỏa mãn `canReactivatePayment` → hiển thị thông báo "Hết hạn thanh toán trong vòng 7 ngày" kèm nút "Kích hoạt lại thanh toán" → gọi API `POST /api/payments/cases/:id/reactivate`.
- Nếu đã quá 7 ngày → hiển thị thông báo "Hồ sơ đã đóng, vui lòng gửi hồ sơ mới".

### 6. RefundRequestButton (mới)

**File:** `_components/RefundRequestButton.tsx`
- Chỉ render khi thỏa mãn `canRequestRefund` (đã trả tiền và chưa có supporter được phân công).
- Nội dung hiển thị: "Hủy hồ sơ & hoàn tiền 100% (chuyên gia chưa được phân công)". Hiển thị Confirm Modal của Mantine trước khi gọi `POST /api/payments/cases/:id/refund`. Hiển thị thông báo (Toast) để admin kiểm duyệt và xử lý.

### 7. Chặn anti-spam tại trang gửi hồ sơ (submit-case)

**File:** submit-case page (nơi gọi API tạo case) + hook `useCreateCase`
- Trước và sau khi gọi: nếu API trả về mã lỗi 409 `ACTIVE_PAYMENT_CASE_EXISTS` → hiển thị toast và cuộn màn hình đến thông báo lỗi "Bạn đang có hồ sơ chờ thanh toán."
- (Tùy chọn thêm) Thực hiện gọi pre-check `GET /api/cases/mine/active-payment` để tắt (disable) nút gửi hồ sơ từ trước.

### 8. CaseStatusHeader

**File:** `_components/CaseStatusHeader.tsx`
- Thêm badge hiển thị trạng thái `triage_accepted`; bảo đảm không làm vỡ bố cục giao diện.

## Acceptance criteria

- [ ] Hồ sơ ở trạng thái `triage_accepted` + `awaiting_confirmation` hiển thị đúng `PackageConfirmationCard`, KHÔNG hiển thị CTA thanh toán
- [ ] Xác nhận gói thành công → chuyển trạng thái sang `pending`, hiển thị CTA thanh toán kèm countdown 72h
- [ ] `PaymentDrawer` chỉ mở được khi case ở trạng thái `pending/rejected`
- [ ] Hết hạn trong vòng 7 ngày → hiển thị nút reactivate; quá 7 ngày → hiện thông báo đóng hồ sơ
- [ ] Đã trả tiền nhưng chưa phân công supporter → hiển thị nút yêu cầu hoàn tiền; đã phân công → ẩn nút
- [ ] Gửi hồ sơ mới khi đang có hồ sơ chờ thanh toán → bị chặn và hiển thị thông báo lỗi rõ ràng
- [ ] Copy văn bản giao diện khớp tài liệu §7; tuyệt đối không dùng Tailwind class định vị đè lên Mantine components
- [ ] `check-types` chạy thành công; có các bài test component cơ bản cho `PackageConfirmationCard` & `ExpiredPaymentNotice`