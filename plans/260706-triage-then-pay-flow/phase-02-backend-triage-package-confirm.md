# Phase 02: Backend — Triage Accept & Package Confirmation

**Status:** `[pending]`
**Depends on:** Phase 01
**Blocks:** Phase 03 (partial), Phase 04, 05

## Tổng quan

Sửa `acceptCase` để tách "triage accept" khỏi "vào under_review": paid package → `triage_accepted` + `awaiting_confirmation`; free → thẳng `under_review` + `not_required`. Thêm endpoint admin đề xuất đổi package, và endpoint student xác nhận package/giá → `pending` + mở cửa sổ thanh toán 72h.

## Tasks

### 1. Sửa `acceptCase` repository

**File:** `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`

`acceptCase(caseId, adminId, options?: { proposedPackageId?, proposedLockedPrice?, packageChangeReason? })`:
- Load case + package.
- Nếu `locked_price === 0` (free): set `user_facing_stage = under_review`, `internal_status = accepted_unassigned`, `payment_status = not_required`, `triage_accepted_at = now`.
- Nếu paid: set `user_facing_stage = triage_accepted`, `internal_status = accepted_unassigned`, `payment_status = awaiting_confirmation`, `triage_accepted_at = now`. Nếu `options.proposedPackageId` khác `package_id` → set `proposed_package_id`, `proposed_locked_price`, `package_change_reason`.
- Event `case_accepted` với metadata `{ proposed_package_id?, package_change_reason? }`.
- Idempotent guard như cũ (kiểm tra stage đã là triage_accepted/under_review).

### 2. Sửa `acceptCaseUseCase` + controller

**Files:** `modules/admin/application/accept-case.usecase.ts`, `modules/admin/http/admin.controller.ts`, `admin.schema.ts`
- Body nhận thêm optional `proposed_package_id` + `package_change_reason` (reason tối thiểu 10 ký tự nếu có proposed).
- Validate proposed package tồn tại + active.

### 3. Confirm-package usecase (mới)

**File:** `modules/payments/application/confirm-package.usecase.ts`
- Input: `userId, caseId, { acceptProposed: boolean }`.
- Guard: case thuộc user; `payment_status === awaiting_confirmation`; `user_facing_stage === triage_accepted`.
- Nếu `acceptProposed && proposed_package_id` → update `package_id = proposed_package_id`, `locked_price = proposed_locked_price`.
- Set `payment_status = pending`, `package_confirmed_at = now`, `payment_window_expires_at = now + 72h`.
- Event `package_confirmed` metadata `{ package_id, locked_price, acceptProposed }`.
- Repository: `confirmPackage(caseId, {...})` trong `payment.repository.ts` (transaction).

### 4. Route + controller + schema

**File:** `modules/payments/http/payments.routes.ts`
```
paymentsRouter.post("/cases/:id/confirm-package", confirmPackageHandler);
```
Controller: auth student (hoặc admin thay mặt), `requireCaseAccess(allowStudent:true)`.

### 5. Free package path

Đảm bảo `createCase` (Phase 03 sẽ thêm anti-spam) với `isFree` vẫn set `payment_status = not_required` (đổi từ `paid`). Tạm chỉ đổi field ở repository create (Phase 01 enum) — Phase 03 lo anti-spam.

## Acceptance criteria

- [ ] Accept paid case → `triage_accepted` + `awaiting_confirmation`, chưa vào under_review
- [ ] Accept free case → `under_review` + `not_required` ngay
- [ ] Admin accept với proposed package → lưu `proposed_package_id/locked_price/reason`
- [ ] `POST /api/payments/cases/:id/confirm-package` → `pending` + `payment_window_expires_at = now+72h`
- [ ] Confirm với `acceptProposed` → package/locked_price cập nhật đúng
- [ ] Idempotent: accept lại case đã triage_accepted → no-op
- [ ] Tests: accept paid/free, confirm package, proposed package flow

## Rollback

Revert acceptCase về set `under_review` trực tiếp; xóa confirm-package route/usecase. (Cần revert cả Phase 03 verify vì phụ thuộc.)