# Phase 03: Backend — Payment Gating, Refund & Expiry

**Status:** `[pending]`
**Depends on:** Phase 01, Phase 02
**Blocks:** Phase 04, Phase 05, Phase 06

## Overview

Cài đặt gating cứng trên toàn bộ flow chuyên môn, sửa upload/verify payment theo trạng thái mới, anti-spam, expiry (reactivate + auto), và refund 3 tầng.

## Tasks

### 1. Upload payment proof — gating mới

**File:** `modules/payments/application/upload-payment-proof.usecase.ts`
- Thay đổi guard: thay `payment_status !== unpaid && !== rejected` → `if (!canUploadProof(payment_status)) throw 409`.
- Tức là chỉ chấp nhận trạng thái `pending` hoặc `rejected`.
- Repository `createPaymentProof`: set case `payment_status = proof_submitted` (đổi từ `pending_verification`).

### 2. Verify payment — transition đúng

**File:** `modules/payments/infrastructure/persistence/payment.repository.ts` (`verifyPayment`)
- `status === paid`: set case `payment_status = paid`, `user_facing_stage = under_review`, `internal_status = accepted_unassigned`. Event `payment_verified`.
- `status === rejected`: set case `payment_status = rejected` (KHÔNG revert về unpaid). Event `payment_rejected`.
- `verify-payment.usecase.ts`: giữ nguyên validation; `isFinalPaymentStatus` đã cập nhật.

### 3. Gating chuyên môn

**File mới:** `modules/payments/domain/payment-gating.ts` (re-export từ payment.types nếu gộp)
- `assertPaymentSatisfied(case)` throw 403 nếu `!isPaymentSatisfied(payment_status)`.

Áp dụng:
- `modules/admin/application/assign-supporter.usecase.ts` + `modules/cases/application/assign-supporter.usecase.ts`: gọi `assertPaymentSatisfied` trước khi assign.
- `modules/cases/infrastructure/persistence/case.repository.ts` `assignCaseSupporter`: guard ở đầu transaction.
- `modules/supporter/application/create-draft-report.usecase.ts`, `edit-draft-report.usecase.ts`, `publish-report.usecase.ts`: guard bằng `assertPaymentSatisfied`.
- `modules/cases/application/update-case-status.usecase.ts`: chặn chuyển sang `under_review` nếu chưa satisfied.

### 4. Anti-spam (create case)

**File:** `modules/cases/application/create-case.usecase.ts`
- Trước khi tạo: `countActivePaymentCases(userId)` đếm case của user có `payment_status IN (awaiting_confirmation, pending, proof_submitted, rejected, expired)` (D13 — mở rộng để chặt spam submit-proof-rác + expired re-activate). Với `expired`: chỉ count khi `expired_at > now - 7d` (trong re-activate window); quá 7 ngày case đã `closed` không count.
- Nếu `>= 1` → throw 409 `ACTIVE_PAYMENT_CASE_EXISTS` kèm message "Bạn đang có một hồ sơ chờ thanh toán. Hoàn tất, hủy, hoặc chờ hết hạn 72h trước khi gửi hồ sơ mới." (Sửa message vì có cancel endpoint — D12.)
- Repository: `countActivePaymentCases` trong `case.repository.ts` (dùng index `[owner_auth_user_id, payment_status]` — D15/Phase-01).
- Free package: vẫn cho tạo (không tính vào slot).
- Race-safe (D14): tạo trong `$transaction`, sau insert re-check `countActivePaymentCases(userId)` (gộp cả case vừa tạo) > 1 → rollback throw 409. Hai createCase concurrent → chỉ 1 thành công.
- Admin bypass (D16): nếu caller từ admin context (tạo case thay user) → flag `skipSpamCheck: true` bỏ qua count. Audit log ghi rõ `spam_check_skipped: true, created_by_admin`.

### 4b. Student cancel case (mới — D12)

**File mới:** `modules/cases/application/cancel-case.usecase.ts` (student)
- Guard: case thuộc user; `user_facing_stage === triage_accepted`; `payment_status IN (awaiting_confirmation, pending, proof_submitted, rejected, expired)`; `assigned_supporter_auth_user_id IS NULL` (chưa assign supporter — nếu đã assign dùng path refund).
- Set `user_facing_stage = closed`, `internal_status = cancelled`. `payment_status` giữ nguyên (audit). Event `case_cancelled_by_student`.
- Lý do: cho user tự giải phóng slot anti-spam thay vì kẹt chờ expiry 72h.
- Route: `POST /api/cases/:id/cancel` (student). Controller `requireCaseAccess(allowStudent: true)`.

### 5. Expiry — reactivate + auto

**File mới:** `modules/payments/application/reactivate-payment.usecase.ts`
- Guard: `payment_status === expired` && `expired_at` trong vòng 7 ngày (`now - expired_at <= 7d`).
- Set `payment_status = pending`, `payment_window_expires_at = now + 72h`, `expired_at = null`.
- Event `payment_reactivated`.
- Route: `POST /api/payments/cases/:id/reactivate` (student).

**File mới:** `modules/payments/application/expire-overdue-payments.usecase.ts`
- Query các case có `payment_status IN (pending, proof_submitted)` AND `payment_window_expires_at < now`.
- Mỗi case: set `payment_status = expired`, `expired_at = now`. Event `payment_expired`. Giữ nguyên `user_facing_stage = triage_accepted`.
- Gọi từ: (a) lazy trong `get-case-detail`/`list-cases` (chỉ case đang query), (b) nút admin "Expire overdue", (c) cron script `apps/api/src/scripts/expire-payments.ts` (Phase 06).

### 6. Refund 3 tầng (manual — D10/D17)

> **Nguyên tắc:** Refund hoàn toàn thủ công như payment. Hệ thống CHỈ quản lý trạng thái + lưu proof file, KHÔNG động tiền thật, KHÔNG tích hợp payment gateway. Admin tự chuyển khoản ngoài hệ thống (bank app) → upload ảnh proof chuyển khoản vào hệ thống → mark complete. Giống `Payment.proof_file_url` hiện tại.

**File mới:** `modules/payments/infrastructure/persistence/refund.repository.ts`
- `createRefund`, `findRefundById`, `listRefunds`, `updateRefundStatus`, `attachRefundProof`.

**File mới:** `modules/payments/application/request-refund.usecase.ts` (student)
- Guard: `payment_status === paid` AND `assigned_supporter_auth_user_id IS NULL` (tier 1). Nếu supporter đã assign → throw 409 `REFUND_NOT_ALLOWED_TIER2` "Supporter đã được phân công, không hoàn tiền theo chính sách."
- Guard duplicate (D8): tồn tại Refund status IN (`requested`,`approved`) cho case → throw 409 `REFUND_ALREADY_PENDING` "Đã có yêu cầu hoàn tiền đang xử lý."
- Tính tier: supporter chưa assign = 1; đã assign chưa có report = 2; đã có report sent = 3. (Request chỉ tạo được ở tier 1.)
- Tạo `Refund` với status `requested`, tier 1, amount = locked_price. Event `refund_requested`.
- Re-request (D9): refund `rejected` trước đó KHÔNG block → cho request lại (tier-1 vẫn thỏa); timeline giữ refund rejected cũ.

**File mới:** `modules/payments/application/process-refund.usecase.ts` (admin)
- Input: `adminId, refundId, { decision: 'approve'|'reject'|'complete', rejection_reason?, bank_transfer_ref?, proofFile? }`.
  - `complete` là **multipart**: admin đã chuyển khoản ngoài hệ thống → upload ảnh proof (`proofFile`) + nhập `bank_transfer_ref` (mã GD text) → save proof file qua `fileStorageService.saveProofFile` (reuse pattern payment) → mark complete.
- `approve`: status `approved` (admin xác nhận ý định sẽ hoàn, chưa chuyển). Event `refund_approved`.
- `complete`: **re-fetch case + re-assert `assigned_supporter_auth_user_id IS NULL`** (D7, race approve→assign→complete). Nếu đã assign → throw 409 `REFUND_TIER_CHANGED`. Yêu cầu `proofFile` + `bank_transfer_ref` bắt buộc (không mark complete trước khi chuyển + upload proof). Save proof → `proof_file_url`; set refund `completed`, `processed_at`, `transferred_at = now`, `bank_transfer_ref`; set case `payment_status = refunded`, `user_facing_stage = closed`, `internal_status = cancelled`. Event `refund_completed`.
- `reject`: status `rejected` + `rejection_reason`. Event `refund_rejected`. (Dành cho tier 1 nhưng admin từ chối vì lý do chính đáng; student có thể re-request — D9.)
- Guard: refund phải ở trạng thái `requested`/`approved` mới xử lý được. `complete` yêu cầu `proofFile` present (server-side validate, không tin client skip).
- File storage: reuse `fileStorageService.saveProofFile` (pattern như `upload-payment-proof.usecase.ts`); lưu `apps/api/uploads/`, URL `/uploads/refund-proof-<ts>-<rand>.<ext>`.
- Notification (D11): `refund_requested` → ping admin dashboard (danh sách refunds pending); `refund_completed`/`refund_rejected` → notify student qua CaseEvent + frontend polling.

**Routes:** `modules/payments/http/payments.routes.ts` + `admin.routes.ts`
```typescript
paymentsRouter.post("/cases/:id/refund", requestRefundHandler);          // student
adminRouter.get("/refunds", listRefundsHandler);
adminRouter.post("/refunds/:id/process", processRefundHandler);          // admin
```

### 7. DTOs & schemas

- `payments.dto.ts`, `payments.schema.ts`: confirm-package, reactivate, refund request/process.
- `admin.schema.ts`: accept với proposed package.

## Acceptance criteria

- [ ] Upload proof bị chặn trừ khi ở trạng thái `pending/rejected`; thành công → `proof_submitted`
- [ ] Verify paid → `paid` + `under_review`; reject → `rejected` (không về unpaid)
- [ ] Assign supporter / tạo & publish report throw 403 khi chưa satisfied
- [ ] Submit case mới bị chặn khi user có case awaiting-payment
- [ ] Expiry 72h → `expired`; re-activate trong 7 ngày → `pending` mới; quá 7 ngày → từ chối
- [ ] Refund tier-1 tạo được; tier-2/3 bị chặn với lý do rõ ràng; complete → `refunded` + closed
- [ ] Refund duplicate (requested/approved tồn tại) → block `REFUND_ALREADY_PENDING`; rejected → re-request được
- [ ] Refund `complete` re-assert tier-1 (race approve→assign → block `REFUND_TIER_CHANGED`); upload ảnh proof + `bank_transfer_ref` bắt buộc; lưu `proof_file_url` + `transferred_at`
- [ ] Refund events đủ: `refund_requested`/`refund_approved`/`refund_rejected`/`refund_completed`
- [ ] Student cancel case awaiting-payment (chưa assign supporter) → `closed`/`cancelled`
- [ ] Anti-spam count bao gồm `rejected` + `expired` (7-day window); message cập nhật
- [ ] Anti-spam race-safe (2 createCase concurrent → 1 rollback); admin tạo thay user bypass
- [ ] Mỗi action ghi `CaseEvent`; audit logger hoạt động bình thường
- [ ] Tests: gating, upload/verify, anti-spam (race + admin bypass), expiry, cancel, refund tier 1/2/3 + duplicate + re-request + race complete

## Rollback

Tắt gating (revert guards), revert upload/verify state, xóa các endpoints refund/reactivate/expire. Cẩn thận với dữ liệu `refunded`/`expired` đã tạo.