---
status: pending
created: 2026-07-06
feature: triage-then-pay-flow
based_on: plans/reports/report-260704-2044-payment-timing-analysis.md
---

# Plan: Triage-then-Pay Flow (Payment Timing & Trust Model)

## Context

Report `report-260704-2044-payment-timing-analysis.md` (v2.0) đã chốt mô hình **Triage-then-Pay**: user trả tiền ngay sau khi Nexus xác nhận tiếp nhận case (triage accept) VÀ user đã xác nhận package/giá — trước khi bắt đầu xử lý chuyên môn. Tương tự consulting firm nhỏ: tư vấn sơ bộ miễn phí → báo giá → khách đồng ý → trả tiền → làm.

**Trạng thái code hiện tại (gap):**
- `acceptCase` đẩy thẳng `user_facing_stage = under_review` không kiểm tra payment → supporter có thể bị assign khi chưa paid.
- `payment_status` chỉ có `unpaid / pending_verification / paid / rejected`; upload proof cho phép trước triage accept.
- Không có bước xác nhận package/giá, không có expiry, không có refund, không có anti-spam.

## Goal

1. Payment gate nằm **sau** triage accept + user xác nhận package/giá, **trước** xử lý chuyên môn.
2. Gating cứng: assign supporter / vào `under_review` / tạo deliverable / đọc sâu tài liệu **chỉ khi** `payment_status IN (paid, not_required)`.
3. Anti-spam: mỗi user tối đa 1 case đang ở trạng thái chờ thanh toán (`awaiting_confirmation / pending / proof_submitted`).
4. Expiry 48-72h: hết hạn → `expired`; trong 7 ngày re-activate được, quá 7 ngày đóng case.
5. Refund 3 tầng: tier-1 (paid, chưa assign supporter) = hoàn 100%; tier-2/3 = không hoàn.
6. Package free bỏ qua payment flow (`not_required`), vào review ngay sau triage.

## Design decisions (tinh chỉnh so với report)

| # | Quyết định | Ghi chú |
|---|-----------|---------|
| D1 | Thêm `awaiting_confirmation` làm payment_status giữa triage-accept và user confirm | Report ngụ ý ở state mapping; tách ra cho gating sạch |
| D2 | Thêm `refunded` payment_status + case → `closed/cancelled` khi refund completed | Report không liệt kê; cần trạng thái cuối rõ |
| D3 | Anti-spam bao gồm cả `awaiting_confirmation` | Report chỉ `pending/proof_submitted`; thêm để chống spam triage |
| D4 | Free package mới = `not_required`; backfill free `paid`→`not_required`; gating `isPaymentSatisfied = paid OR not_required` | Tương thích legacy |
| D5 | Expiry: lazy on-read + nút admin + cron script | `expired` giữ `user_facing_stage = triage_accepted` |
| D6 | Refund tier-1: student request → admin complete; tier 2/3 auto-reject | Vẫn cần admin action chuyển khoản thật |
| D7 | Refund `complete` re-assert tier-1 guard (re-fetch case, check `assigned_supporter_auth_user_id IS NULL`) | Race: admin approve xong, admin khác assign supporter giữa chừng → complete giờ sai tier |
| D8 | Refund duplicate request guard: tồn tại Refund status IN (`requested`,`approved`) cho case → block 409 `REFUND_ALREADY_PENDING` | Chống 2 refund cùng chạy trên 1 case |
| D9 | Refund `rejected` → cho re-request tier-1 (admin reject không chốt vĩnh viễn) | Tier-1 vẫn thỏa điều kiện; timeline giữ reject cũ |
| D10 | Refund `complete`: admin đã chuyển khoản ngoài hệ thống (manual bank transfer) → upload ảnh proof chuyển khoản → mark complete. Refund model thêm `proof_file_url` (giống `Payment.proof_file_url`), `bank_transfer_ref` (mã GD text), `transferred_at`. Hệ thống CHỈ track status + proof metadata, KHÔNG quản lý tiền thật | Refund cũng manual như payment; admin tự chuyển ngoài rồi upload ảnh + mark |
| D11 | Refund events đủ: `refund_requested` + `refund_approved` + `refund_rejected` + `refund_completed` | Timeline đủ; plan gốc chỉ nêu 2 → bổ sung 2 |
| D12 | Thêm student `cancel-case` endpoint cho case `triage_accepted` + `payment_status IN (awaiting_confirmation, pending, proof_submitted, rejected, expired)` AND `assigned_supporter_auth_user_id IS NULL` | Code hiện KHÔNG có cancel → user kẹt slot chỉ chờ expiry 72h; cho tự giải phóng |
| D13 | Anti-spam count mở rộng bao gồm `rejected` + `expired` (trong 7-day re-activate window) | Chặt spam (submit proof rác → reject → spam); có cancel + reactivate lối thoát |
| D14 | Anti-spam race-safe: `$transaction` + post-insert re-check `countActivePaymentCases > 0` → rollback | 2 createCase concurrent cùng pass pre-check; Prisma không native `SELECT FOR UPDATE` dễ |
| D15 | Case index `@@index([owner_auth_user_id, payment_status])` cho `countActivePaymentCases` | Phase-01 migration thêm; query anti-spam |
| D16 | Admin tạo case thay user → bypass anti-spam (flag `skipSpamCheck` từ admin context) | Admin nhờ user / nhập thay; không kẹt rule |
| D17 | Refund manual = payment manual: student request → admin approve (intent) → admin chuyển khoản ngoài hệ thống → admin upload ảnh proof chuyển khoản + mã GD → mark complete. Hệ thống chỉ quản lý trạng thái + lưu proof file, không động tiền thật | Nhất quán với payment flow hiện tại (`Payment.proof_file_url`); không tích hợp payment gateway |

## State machine (payment_status)

```
unpaid (submit, chưa triage)
  └─ triage accept (paid pkg) ──▶ awaiting_confirmation
        └─ user confirm package ──▶ pending  (đặt payment_window_expires_at = now+72h)
              ├─ user upload proof ──▶ proof_submitted
              │     ├─ admin verify ok ──▶ paid  (+ under_review)
              │     └─ admin verify reject ──▶ rejected ──(re-upload)──▶ proof_submitted
              └─ hết hạn ──▶ expired
                    ├─ trong 7 ngày re-activate ──▶ pending
                    └─ quá 7 ngày ──▶ closed (case)
free pkg: triage accept ──▶ not_required (+ under_review ngay)
paid ── refund completed ──▶ refunded (+ closed)
```

## Phases

- [Phase 01: Schema & State Machine Foundation](./phase-01-schema-state-foundation.md) — `[pending]`
- [Phase 02: Backend — Triage Accept & Package Confirmation](./phase-02-backend-triage-package-confirm.md) — `[pending]`
- [Phase 03: Backend — Payment Gating, Refund & Expiry](./phase-03-backend-payment-gating-refund-expiry.md) — `[pending]`
- [Phase 04: Frontend — Student Payment Journey](./phase-04-frontend-student-journey.md) — `[pending]`
- [Phase 05: Frontend — Admin & Supporter Gating](./phase-05-frontend-admin-supporter-gating.md) — `[pending]`
- [Phase 06: Automation, Tests & Verification](./phase-06-automation-tests-verification.md) — `[pending]`

## Edge cases

| # | Scenario | Phase |
|---|----------|-------|
| E1 | User upload proof trước khi triage accept | 02/03 (block) |
| E2 | Admin đề xuất package khác sau triage | 02 |
| E3 | User không confirm package, kéo dài | 03 (expiry) |
| E4 | Proof reject → re-upload | 03 |
| E5 | Hết hạn trong 7 ngày vs quá 7 ngày | 03 |
| E6 | Refund sau khi supporter đã assign | 03 (reject) |
| E7 | Spam submit nhiều case không trả tiền | 03 (anti-spam) |
| E8 | Free package | 02 |
| E9 | Legacy free case `payment_status=paid` | 01 (backfill) |
| E10 | Supporter cố tạo report khi chưa paid | 03/05 (gate) |
| E11 | Admin approve refund rồi admin khác assign supporter giữa chừng → complete block | 03 (re-assert D7) |
| E12 | Student request refund 2 lần (requested/approved tồn tại) | 03 (D8) |
| E13 | Refund rejected → student re-request tier-1 | 03 (D9) |
| E14 | Student kẹt slot không hủy, không muốn trả tiền | 03 (cancel D12) |
| E15 | 2 createCase concurrent cùng pass count check | 03 (race D14) |
| E16 | Submit proof rác → admin reject → tạo case mới spam | 03 (count rejected D13) |
| E17 | Expired re-activate khi đã có active case khác → block tạo mới / block reactivate | 03 (D13) |
| E18 | Admin tạo case thay user | 03 (bypass D16) |

## Touch areas

### Database
- `prisma/schema.prisma` — Case fields mới, model `Refund`, mở rộng enum (text) payment_status

### Backend API (`apps/api/src`)
- `modules/cases/domain/case.types.ts`, `modules/payments/domain/payment.types.ts`
- `modules/cases/infrastructure/persistence/case.repository.ts` (acceptCase, createCase spam check)
- `modules/cases/application/create-case.usecase.ts`
- `modules/admin/application/accept-case.usecase.ts`, `assign-supporter.usecase.ts`
- `modules/payments/application/upload-payment-proof.usecase.ts`, `verify-payment.usecase.ts`
- `modules/payments/infrastructure/persistence/payment.repository.ts`
- `modules/payments/http/payments.controller.ts`, `payments.routes.ts`, `payments.schema.ts`
- `modules/admin/http/admin.controller.ts`, `admin.routes.ts`
- `modules/supporter/application/*` (gating draft/publish report)
- mới: `modules/payments/application/confirm-package.usecase.ts`, `reactivate-payment.usecase.ts`, `expire-overdue-payments.usecase.ts`, `request-refund.usecase.ts`, `process-refund.usecase.ts`
- mới: `modules/cases/application/cancel-case.usecase.ts` (student, giải phóng slot anti-spam)
- mới: `modules/payments/infrastructure/persistence/refund.repository.ts`

### Frontend Web (`apps/web-1`)
- `types/case.ts`, `types/payment.ts`, `lib/pricing.ts`
- `app/dashboard/case/[id]/page.tsx`
- `app/dashboard/case/[id]/_components/UnpaidAlertBanner.tsx`
- `app/dashboard/case/[id]/_components/PaymentDrawer.tsx`
- `app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`
- mới: `app/dashboard/case/[id]/_components/PackageConfirmationCard.tsx`
- mới: `app/dashboard/case/[id]/_components/ExpiredPaymentNotice.tsx`
- mới: `app/dashboard/case/[id]/_components/RefundRequestButton.tsx`
- `app/dashboard/case/[id]/payment/page.tsx`
- `app/dashboard/submit-case/page.tsx` (hoặc submit-case page logic / hook useCreateCase)
- `app/supporter/case/[id]/page.tsx`
- `app/supporter/case/[id]/review/page.tsx`

- `app/admin/page.tsx` (bảng điều khiển admin chính)
- `app/admin/hooks/useAdminCases.ts` (cập nhật acceptCase mutation truyền proposed package)
- `app/admin/hooks/useAdminPayments.ts` (cập nhật verify mutation nếu cần)
- `app/admin/_components/AdminCaseDetailModal.tsx` (giao diện triage chọn proposed package & reason)
- `app/admin/_components/AdminPaymentVerificationTable.tsx` (cập nhật bộ lọc trạng thái và hiển thị label mới)
- mới: `app/admin/_components/AdminRefundTable.tsx` (giao diện quản lý các yêu cầu refund)


## Success criteria

- [ ] Triage accept case paid → `user_facing_stage = triage_accepted`, `payment_status = awaiting_confirmation` (chưa vào under_review)
- [ ] User confirm package → `pending` + `payment_window_expires_at` đặt đúng
- [ ] Upload proof bị chặn khi chưa `pending`; chỉ chấp nhận `pending/rejected`
- [ ] Verify paid → `paid` + `under_review`; verify reject → `rejected` (giữ ở triage_accepted)
- [ ] Assign supporter / tạo & publish report bị chặn khi `!isPaymentSatisfied`
- [ ] Free package → `not_required` + vào `under_review` ngay sau triage
- [ ] Anti-spam chặn submit case mới khi user đã có case awaiting-payment
- [ ] Expiry 72h → `expired`; re-activate trong 7 ngày; quá 7 ngày đóng case
- [ ] Refund tier-1 cho phép, tier 2/3 reject; completed → `refunded` + case closed
- [ ] Refund `complete` re-assert tier-1 (race approve→assign→complete → block)
- [ ] Refund duplicate (requested/approved tồn tại) → block `REFUND_ALREADY_PENDING`
- [ ] Refund rejected → student re-request được
- [ ] Refund complete: admin upload ảnh proof chuyển khoản + `bank_transfer_ref` → `refunded` + closed (manual, hệ thống chỉ track status)
- [ ] Refund events đủ: requested + approved + rejected + completed
- [ ] Student cancel case awaiting-payment (chưa assign supporter) → `closed`/`cancelled`
- [ ] Anti-spam count bao gồm `rejected` + `expired` (7-day window)
- [ ] Anti-spam race-safe (concurrent createCase → 1 thành công, 1 rollback)
- [ ] Admin tạo case thay user bypass anti-spam
- [ ] UX copy đúng report §7; status badge hiển thị đúng mọi state mới
- [ ] Backend + frontend tests pass; `npm run check-types` pass
- [ ] **Migration tuân `.agents/rules/prisma-migration-safety.md`:** additive-only schema migration, backfill script riêng, index CONCURRENTLY, backup gate, Migration Safety Report, human-run checklist, KHÔNG `migrate dev`/`db push`/DROP trên prod