# Phase 06: Automation, Tests & Verification

**Status:** `[pending]`
**Depends on:** Phase 01-05

## Overview

Tự động hóa việc quét hết hạn thanh toán (cron), phát triển bộ test suite (backend gating/transition/anti-spam/expiry/refund + frontend component tests), và chuẩn bị danh sách kiểm tra đối chiếu (verification checklist) đối chiếu trực tiếp với các rủi ro tại §6 và nội dung copy văn bản tại §7 của report.

## Tasks

### 1. Script tự động quét hết hạn thanh toán (Expiry cron script)

**File mới:** `apps/api/src/scripts/expire-payments.ts`
- Gọi đến hàm thực thi của `expireOverduePaymentsUseCase()`.
- Chạy định kỳ thông qua trình lập lịch tác vụ (task scheduler hoặc cron job) — viết hướng dẫn chạy chi tiết ở phần header của script (sử dụng lệnh chạy bằng node + tsx). Yêu cầu mức MVP: chạy tần suất 1 giờ / lần.
- Ghi log (Logging): hiển thị số lượng hồ sơ đã bị đánh dấu hết hạn (`expired`).

### 2. Tự động kiểm tra hết hạn (Lazy expiry) khi đọc dữ liệu

- Trong `get-case-detail.usecase` hoặc `list-admin-cases.usecase`: tiến hành gọi ngầm hàm `expireOverduePayments` cho tập hợp các hồ sơ đang được truy vấn (ở chế độ best-effort, chạy bất đồng bộ để tránh làm nghẽn hoặc chậm tốc độ trả về kết quả response).

### 3. Backend tests

**Files:** `apps/api/src/shared/infrastructure/tests/`
- `phase-payment-gating.test.ts`: Kiểm tra việc phân công supporter / tạo report bị chặn khi chưa thanh toán; và được mở khóa khi trạng thái là `paid` hoặc `not_required`.
- `phase-payment-transition.test.ts`: Kiểm tra việc upload minh chứng chỉ cho phép khi ở trạng thái `pending/rejected`; kiểm tra duyệt paid chuyển sang `under_review`; duyệt reject chuyển sang `rejected`.
- `phase-anti-spam.test.ts`: Gửi hồ sơ thứ 2 khi đang có hồ sơ ở trạng thái pending sẽ trả về mã lỗi 409.
- `phase-expiry.test.ts`: Hồ sơ quá hạn chuyển thành `expired`; cho phép kích hoạt lại trong vòng 7 ngày; quá 7 ngày thì hệ thống từ chối.
- `phase-refund.test.ts`: Yêu cầu hoàn tiền tier-1 thành công; yêu cầu tier-2/3 bị từ chối; hoàn tất hoàn tiền chuyển trạng thái sang `refunded` và đóng hồ sơ (`closed`).
- Cập nhật toàn bộ các bộ test cũ đang dùng `pending_verification` sang `proof_submitted`, và gói miễn phí chuyển từ `paid` sang `not_required`.

### 4. Frontend tests

- `PackageConfirmationCard` kiểm tra hiển thị theo 2 trường hợp (có đề xuất đổi gói hoặc giữ nguyên gói gốc).
- `ExpiredPaymentNotice` kiểm tra hiển thị theo 2 trường hợp (trong vòng 7 ngày hoặc đã quá 7 ngày).
- `RefundRequestButton` kiểm tra việc ẩn nút khi supporter đã được phân công.

### 5. Danh sách kiểm tra đối chiếu (Verification checklist)

| Phần trong Report | Nội dung xác minh |
|-------------------|------------------|
| §4 Quy tắc gating | Test backend + Chặn giao diện workspace của supporter |
| §5 Ánh xạ trạng thái | Mọi cặp (stage, payment_status) hiển thị đúng nhãn mô tả ở màn hình user |
| §6 Rủi ro 1: Spam | Chạy thử nghiệm test chống gửi nhiều hồ sơ |
| §6 Rủi ro 3: Trì hoãn | Test quét tự động và thủ công việc hết hạn thanh toán |
| §6 Hoàn tiền 3 tầng | Test đầy đủ các kịch bản hoàn tiền theo phân tầng |
| §7 Copy văn bản | So khớp chuẩn xác từng câu chữ, thông điệp hiển thị trên UI |

### 6. Kiểm tra kiểu dữ liệu & build dự án

```bash
npm run check-types
npm run build
```

## Acceptance criteria

- [ ] Script cron chạy thành công, không phát sinh lỗi và ghi log đúng số lượng hồ sơ hết hạn
- [ ] Toàn bộ các ca kiểm thử (tests) backend vượt qua (pass); có đủ độ bao phủ (coverage) cho gating, refund, expiry
- [ ] Các bài kiểm thử thành phần frontend (frontend component tests) vượt qua (pass)
- [ ] Hoàn thành 100% các hạng mục trong danh sách kiểm tra đối chiếu
- [ ] Lệnh `check-types` và `build` thành công, không có lỗi biên dịch