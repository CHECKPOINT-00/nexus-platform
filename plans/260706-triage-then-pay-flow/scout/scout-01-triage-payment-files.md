# Codebase Scout: Triage-then-Pay Flow Files & Symbols

## Scope
Locating all components, controllers, use cases, types, routes, schemas, and database files affected by the new payment timing and trust model (Triage-then-Pay).

## 1. Database Schema
- [schema.prisma](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/prisma/schema.prisma)
  - Key models: `Case`, `Payment`, and the new `Refund` model.
  - Fields to introduce: `triage_accepted_at`, `package_confirmed_at`, `payment_window_expires_at`, `expired_at`, `proposed_package_id`, `proposed_locked_price`, `package_change_reason`.

## 2. Domain Types & Helpers
### Backend
- [case.types.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/cases/domain/case.types.ts)
  - `VALID_CASE_STAGES` and `isValidStageTransition` mapping transitions from `submitted` to `triage_accepted`.
- [payment.types.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/payments/domain/payment.types.ts)
  - Gating helpers like `isPaymentSatisfied`, `canUploadProof`, `canConfirmPackage`, `canReactivatePayment`.

### Frontend
- [case.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/types/case.ts)
  - Updates to `Case` interface with the new stages and fields.
- [payment.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/types/payment.ts)
  - New types mapping the `Refund` model and its statuses.
- [pricing.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/lib/pricing.ts)
  - `getCaseEffectivePrice`, `caseRequiresPayment`, and `formatPrice` helpers.

## 3. Backend API Use Cases & Repositories
- [case.repository.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts)
  - Functions to inspect/update: `acceptCase`, `createCaseWithCheckpointAndIntake`, and count queries for anti-spam.
- [create-case.usecase.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/cases/application/create-case.usecase.ts)
  - Entry point for user case creation to check anti-spam limits.
- [accept-case.usecase.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/admin/application/accept-case.usecase.ts)
  - Logic to transition to `triage_accepted` and handle initial package settings.
- [assign-supporter.usecase.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/cases/application/assign-supporter.usecase.ts)
  - Needs gating: prevent supporter assignment if payment is not satisfied (`paid` or `not_required`).
- [upload-payment-proof.usecase.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts)
  - Gate proof upload strictly to `pending` or `rejected` state.
- [verify-payment.usecase.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/payments/application/verify-payment.usecase.ts)
  - Transitions case to `under_review` upon successful verification.

## 4. Frontend Workspace Surfaces & Components
- [PaymentDrawer.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/dashboard/case/%5Bid%5D/_components/PaymentDrawer.tsx)
  - Upload mechanics and bank transfer details.
- [UnpaidAlertBanner.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/dashboard/case/%5Bid%5D/_components/UnpaidAlertBanner.tsx)
  - Banner shown to students when payment is overdue or pending.
- [AdminCaseDetailModal.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx)
  - Admin view to triage and approve/reject cases.
- [AdminPaymentVerificationTable.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/_components/AdminPaymentVerificationTable.tsx)
  - Table to list payments with status filters (needs mapping updates from `pending_verification` to `proof_submitted`).
- [useAdminCases.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/hooks/useAdminCases.ts)
  - Mutations for admin case actions (triage accept).
- [useAdminPayments.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/hooks/useAdminPayments.ts)
  - Query hooks for managing verification.
- [page.tsx (Admin Dashboard)](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/page.tsx)
  - Tab dashboard containing cases, payments, and refunds.
- [AdminRefundTable.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/_components/AdminRefundTable.tsx)
  - New table for tracking and processing tier-1 refund requests.
- [page.tsx (Submit Case)](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/dashboard/submit-case/page.tsx)
  - Page for creating a new case, where active payment checks must be gated.
- [page.tsx (Supporter Review Page)](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/supporter/case/%5Bid%5D/review/page.tsx)
  - Critique editor screen which must be gated to prevent unauthorized report drafting before payment.


