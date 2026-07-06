# Phase 01: Schema & State Machine Foundation

**Status:** `[pending]`
**Depends on:** nothing
**Blocks:** Phase 02, 03, 04, 05

## Tổng quan

Mở rộng Prisma schema (fields Case mới + model `Refund`), mở rộng enum `payment_status` và `user_facing_stage`, tạo migration + backfill, và cập nhật domain types (`case.types.ts`, `payment.types.ts`) kèm gating helpers. Không đổi behavior runtime ở phase này — chỉ nền tảng.

## Tasks

### 1. Cập nhật Prisma schema

**File:** `prisma/schema.prisma`

Thêm vào `Case`:
```prisma
  triage_accepted_at        DateTime?
  package_confirmed_at      DateTime?
  payment_window_expires_at DateTime?
  expired_at                DateTime?
  proposed_package_id       String?
  proposed_locked_price     Int?
  package_change_reason     String?  @db.Text
```
Quan hệ `proposed_package_id` → `ServicePackage` (nullable FK, `onDelete: SetNull`).

Thêm index cho anti-spam query (D15): `@@index([owner_auth_user_id, payment_status])` (phục vụ `countActivePaymentCases`).

Thêm model `Refund`:
```prisma
model Refund {
  id                    String    @id @default(uuid())
  case_id               String
  payment_id            String
  tier                  Int       // 1 | 2 | 3
  amount                Int
  status                String    @default("requested") // requested|approved|rejected|completed
  reason                String?   @db.Text
  rejection_reason      String?   @db.Text
  proof_file_url        String?   // ảnh proof chuyển khoản do admin upload (D10/D17, giống Payment.proof_file_url)
  bank_transfer_ref     String?   // mã GD chuyển khoản thật (text, D10)
  requested_by          String
  processed_by          String?
  requested_at          DateTime  @default(now())
  processed_at          DateTime?
  transferred_at        DateTime? // thời điểm admin chuyển tiền ngoài hệ thống (D10)
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  case          Case     @relation(fields: [case_id], references: [id], onDelete: Cascade)
  payment       Payment  @relation(fields: [payment_id], references: [id])
  requester     User     @relation("RefundRequester", fields: [requested_by], references: [id])
  processor     User?    @relation("RefundProcessor", fields: [processed_by], references: [id])

  @@index([case_id])
  @@index([status])
  @@map("refunds")
}
```
Thêm relations `refunds Refund[]` vào `Case`, `Payment`, và `refund_requests`/`refund_processes` vào `User`.

### 2. Mở rộng enums (text — không dùng Prisma enum)

> **Quan trọng (rule prisma-migration-safety §Enum Safety):** `payment_status` và `user_facing_stage` là cột `TEXT`, KHÔNG phải Postgres enum type. Prisma schema không khai báo `enum`. Việc "mở rộng enum" ở đây = mở rộng danh sách giá trị hợp lệ trong domain types TS + valid, KHÔNG phải `ALTER TYPE`. Không sinh SQL enum. Tránh nhầm thành Prisma `enum` — sẽ trigger drop-and-recreate hủy dữ liệu.

`payment_status` mới: `unpaid, not_required, awaiting_confirmation, pending, proof_submitted, paid, rejected, expired, refunded`.
(Legacy `pending_verification` sẽ được backfill → `proof_submitted` — xem §3b.)

`user_facing_stage` mới: thêm `triage_accepted`.

### 3. Migration — theo `.agents/rules/prisma-migration-safety.md`

> **Bắt buộc tuân rule.** Phase này chạm DB = high-risk. Agent KHÔNG tự apply migration lên prod. Chỉ prepare + review + handoff checklist cho human.

#### 3a. Target DB & migration classification (rule §1, §2)

- **Target env:** dev (local) → staging → production (Supabase). Xác nhận `DATABASE_URL`/`DIRECT_URL` trước mọi lệnh.
- **Migration type:** **additive safe** (add nullable columns, new table, new relations) + **data backfill** (UPDATE trên dữ liệu thật, risky) + **index** (lock risk prod).
- **Production data risk:** YES — `cases` có dữ liệu thật; `payment_status`/`user_facing_stage` UPDATE thay đổi state thật.
- **Cấm:** `npm run prisma:migrate` (= `prisma migrate dev`) trên prod. `db push`, `migrate reset`, `migrate resolve` cấm tuyệt đối.

#### 3b. Tách 3 artifact (không gộp — rule §Data Migration)

**Artifact 1 — Schema migration (additive, Prisma-managed):**
```bash
# LOCAL ONLY (DATABASE_URL = localhost):
npx prisma migrate dev --create-only --name triage_then_pay_flow_foundation --schema prisma/schema.prisma
```
- Sinh `prisma/migrations/<ts>_triage_then_pay_flow_foundation/migration.sql`.
- Review SQL: chỉ `ALTER TABLE cases ADD COLUMN` (nullable), `CREATE TABLE refunds`, `ADD CONSTRAINT ... FOREIGN KEY`, `CREATE INDEX`.
- **KHÔNG nhét UPDATE data backfill vào migration.sql.** (rule §Data Migration: script riêng.)
- **Flag high-risk SQL:** `ON DELETE CASCADE` trên `refunds.case_id` (table mới, chưa data → OK, note rõ); `ADD CONSTRAINT FOREIGN KEY` (full table scan `cases` — ước lượng row count trước, rule §Table Lock).
- Validate: `npx prisma validate --schema prisma/schema.prisma`.

**Artifact 2 — Index CONCURRENTLY (separate, prod-safe):**

Prisma migration KHÔNG hỗ trợ `CREATE INDEX CONCURRENTLY` (không chạy được trong transaction). Tách index `[owner_auth_user_id, payment_status]` (D15) ra script riêng:
- Script `apps/api/src/scripts/create-anti-spam-index.sql`:
```sql
-- Chạy riêng, ngoài transaction, trên prod:
CREATE INDEX CONCURRENTLY IF NOT EXISTS cases_owner_payment_status_idx
  ON cases (owner_auth_user_id, payment_status);
```
- Dev: chạy thường. Prod: human-run, không lock writes (rule §Table Lock).

**Artifact 3 — Data backfill script (separate, reviewed, idempotent):**

**File:** `apps/api/src/scripts/backfill-payment-status.ts` (KHÔNG nhét trong migration.sql)
- Idempotent: `WHERE payment_status = 'pending_verification'` → chạy lại không đổi gì nếu đã backfill.
- Batch-safe: chia chunk nếu cases > 10k rows.
- Logged: in ra count trước/sau mỗi UPDATE.
- Tested local first.
- 3 UPDATE (chỉ chạy sau human confirm COUNT):
```sql
SELECT COUNT(*) FROM cases WHERE payment_status = 'pending_verification';
SELECT COUNT(*) FROM cases WHERE payment_status = 'paid' AND locked_price = 0;
SELECT COUNT(*) FROM cases WHERE internal_status = 'accepted_unassigned'
  AND payment_status NOT IN ('paid','not_required');

UPDATE cases SET payment_status = 'proof_submitted' WHERE payment_status = 'pending_verification';
UPDATE cases SET payment_status = 'not_required' WHERE payment_status = 'paid' AND locked_price = 0;
UPDATE cases SET user_facing_stage = 'triage_accepted'
  WHERE internal_status = 'accepted_unassigned' AND payment_status NOT IN ('paid','not_required');
```
- Post-check: `SELECT payment_status, COUNT(*) FROM cases GROUP BY 1;` — confirm không còn `pending_verification`, `not_required` xuất hiện.

#### 3c. Backup gate (rule §7)

Trước prod: human phải tạo + verify backup:
```bash
npx supabase db dump --db-url "$PROD_DATABASE_URL" -f backup_roles_YYYYMMDD.sql --role-only
npx supabase db dump --db-url "$PROD_DATABASE_URL" -f backup_schema_YYYYMMDD.sql
npx supabase db dump --db-url "$PROD_DATABASE_URL" -f backup_data_YYYYMMDD.sql --use-copy --data-only
```
- Verify file tồn tại + non-empty.
- (Recommended) restore test trên local DB.
- Agent KHÔNG proceed trừ khi human confirm: "I have created and verified a production backup."

#### 3d. Migration Safety Report (rule §9 — agent produce trước handoff)

Agent phải hoàn thành report sau (template rule §9) trước khi handoff:
- Target: env, DB host, prod data risk
- Intended change: summary, type, tables/columns affected
- Data risk: mất data? lock? break app? break RLS?
- Generated files: migration folder, SQL, 2 script
- Dangerous SQL found: DROP/TRUNCATE/DELETE/ALTER COLUMN/SET NOT NULL/UNIQUE/FK/CASCADE — flag từng cái
- Required checks before deploy: 4 COUNT query
- Backup status: required/confirmed/restore tested
- Deploy command: `npx prisma migrate deploy --schema prisma/schema.prisma` + 2 script riêng
- Rollback strategy: restore from backup, KHÔNG DROP prod

#### 3e. Human-run checklist (rule §10)

Agent phải handoff checklist copy-paste-ready:
1. Pre-flight: review migration.sql + 2 script, confirm `.env` URLs (DIRECT_URL port 5432)
2. Step 1 Backup (REQUIRED): 3 lệnh `npx supabase db dump`, verify non-empty, restore test
3. Step 2 Pre-migration checks: 4 COUNT query read-only, confirm count match
4. Step 3 Apply schema: `npx prisma migrate deploy --schema prisma/schema.prisma`
5. Step 4 Create index: `psql "$DIRECT_URL" -f create-anti-spam-index.sql` (CONCURRENTLY)
6. Step 5 Backfill: `npx tsx backfill-payment-status.ts`, confirm log count
7. Step 6 Generate client: `npm run prisma:generate`
8. Step 7 Post-verify: GROUP BY payment_status + user_facing_stage, COUNT refunds
9. Rollback: restore backup, revert app code, KHÔNG DROP prod

### 4. Domain types & gating helpers

**File:** `apps/api/src/modules/payments/domain/payment.types.ts`
- `VALID_PAYMENT_STATUSES` đầy đủ.
- `isPaymentSatisfied(status) => status === 'paid' || status === 'not_required'`
- `canUploadProof(status) => status === 'pending' || status === 'rejected'`
- `canConfirmPackage(status) => status === 'awaiting_confirmation'`
- `canReactivatePayment(status) => status === 'expired'`
- `isActivePaymentWindow(status) => ['awaiting_confirmation','pending','proof_submitted'].includes(status)`
- `isFinalPaymentStatus` cập nhật (paid, not_required, expired, refunded).

**File:** `apps/api/src/modules/cases/domain/case.types.ts`
- Thêm `triage_accepted` vào `VALID_CASE_STAGES`.
- Cập nhật `isValidStageTransition`: `triage_accepted → under_review | closed`; `submitted → triage_accepted | need_more_information | rejected | closed`.

### 5. Regenerate client

```bash
npm run prisma:generate
npm run check-types
```

## Acceptance criteria

- [ ] Schema migration `migration.sql` chỉ chứa additive SQL (ADD COLUMN nullable, CREATE TABLE, ADD FK); KHÔNG có UPDATE/DROP
- [ ] `npx prisma validate` pass; `refunds` table + Case columns trong schema
- [ ] Backfill script `backfill-payment-status.ts` idempotent + log count trước/sau; test local pass
- [ ] Index script `create-anti-spam-index.sql` dùng `CONCURRENTLY`
- [ ] Migration Safety Report (§3d) hoàn chỉnh; human confirm backup
- [ ] Human-run checklist (§3e) rõ ràng, copy-paste-ready
- [ ] Sau deploy: không còn `pending_verification`; free cases = `not_required`; `triage_accepted` xuất hiện đúng
- [ ] `triage_accepted` là stage hợp lệ; transition map cập nhật
- [ ] Gating helpers type-safe + unit test
- [ ] `check-types` pass

## Rollback

> **Rule prisma-migration-safety:** KHÔNG `DROP COLUMN` / `DROP TABLE` trên prod. Rollback = restore from backup + revert app code.

- Prod fail → restore từ backup (§3c Step 1) → revert app code về commit trước phase-01.
- Dev/staging chưa có data thật → có thể drop columns + refunds table local (`npx prisma migrate reset` CHỈ local, KHÔNG prod).
- Nếu backfill sai → restore backup (UPDATE không thể reverse an toàn vì mất state cũ).
- Nếu chỉ schema additive fail (chưa backfill) → restore backup đủ, app code revert.