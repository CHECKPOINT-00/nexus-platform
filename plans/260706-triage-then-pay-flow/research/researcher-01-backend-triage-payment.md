# Backend & Schema Research Report: Triage-then-Pay Flow

## Scope
Analysis of database models, backend logic changes, state transitions, anti-spam mechanisms, refund mechanics, and database migration safety constraints.

## 1. Database Schema & State Transitions
- **Additive Schema Modifications:** We will introduce 7 new optional fields to the `Case` model in [schema.prisma](../../../prisma/schema.prisma) and define the new `Refund` model representing tier-based manual refunds.
- **Index Optimization:** A composite index `@@index([owner_auth_user_id, payment_status])` will speed up anti-spam validations.
- **State Machine Transitions:**
  - Case moves from `submitted` to `triage_accepted` (with `payment_status = awaiting_confirmation` for paid packages).
  - Student confirms the package, transitioning `payment_status` to `pending` and setting `payment_window_expires_at = now + 72h`.
  - Student uploads proof, changing `payment_status` to `proof_submitted` (legacy `pending_verification`).
  - Admin verifies payment → `payment_status = paid` and case transitions to `under_review`.
  - Admin rejects proof → `payment_status = rejected`, allowing the student to re-upload.
  - If 72h window passes without payment, case becomes `expired`. Student can re-activate within 7 days, returning to `pending`.

## 2. Gating & Invariants
- **Supporter Assignment Gate:** In [assign-supporter.usecase.ts](../../../apps/api/src/modules/cases/application/assign-supporter.usecase.ts), we must assert that `isPaymentSatisfied` (`paid` or `not_required`) before permitting supporter assignment.
- **Proof Upload Gate:** In [upload-payment-proof.usecase.ts](../../../apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts), proof upload is only allowed when `payment_status` is `pending` or `rejected`.

## 3. Anti-Spam & Concurrent Race Conditions
- **Constraint:** A student can have at most 1 case in `awaiting_confirmation`, `pending`, `proof_submitted`, `rejected`, or `expired` (within 7-day window) status.
- **Race Safety:** Since Prisma does not support `SELECT FOR UPDATE` out of the box inside general transactions, we will perform a pre-check count, execute the creation within a transaction, and re-check `countActivePaymentCases` immediately after insertion, rolling back if it exceeds 1.
- **Admin Bypass:** An optional `skipSpamCheck` flag will allow admins to create cases for students without triggering the limit.

## 4. Refund Architecture
- **Tier-1 Refund:** Eligible if `payment_status` is `paid` AND `assigned_supporter_auth_user_id` is `NULL`.
- **Race Condition Guard:** When completing a refund, we must re-assert the condition `assigned_supporter_auth_user_id IS NULL` to prevent a race condition where a supporter is assigned in parallel.
- **Manual Refund Verification:** Admin processes the refund externally, uploads a transaction receipt (`proof_file_url`), inputs the bank reference `bank_transfer_ref`, and marks it `completed` → transitioning case to `closed/cancelled` and `payment_status` to `refunded`.

## 5. Migration Safety
- **Additive-Only Schema Deploy:** Local DB runs standard migrations, while Production only receives `npx prisma migrate deploy` for safety.
- **Index Creation:** Handled via `CREATE INDEX CONCURRENTLY` in a separate raw SQL command to prevent blocking table locks.
- **Data Backfill:** An idempotent TS script will run separate from the schema migration to backfill legacy free cases (`payment_status = not_required`) and transition `pending_verification` to `proof_submitted`.

## Unresolved Questions
- Should the anti-spam limit also count cases where the user has been rejected during triage but hasn't closed the case?
- Do we need to automatically trigger slack/email alerts when a refund request is submitted by a student?
