# Migration Safety Report - Triage-then-Pay Flow Foundation

### Target
- Environment: dev / staging / production
- Database: Supabase PostgreSQL / Local Postgres
- Production data risk: Low to Medium (mostly safe additive schema updates, data backfill update is idempotent)

### Intended change
- Summary: Add new fields for payment timing (triage accept, package confirm, expiry, proposed package details), add index for anti-spam, and add `refunds` table to manage manual refund processing.
- Migration type: Safe additive schema change + Separate concurrent index creation + Separate idempotent backfill script.
- Tables affected: `cases`, `users`, `payments`, and new `refunds` table.
- Columns affected:
  - `cases`: `triage_accepted_at` (DateTime?), `package_confirmed_at` (DateTime?), `payment_window_expires_at` (DateTime?), `expired_at` (DateTime?), `proposed_package_id` (String?), `proposed_locked_price` (Int?), `package_change_reason` (String?)

### Data risk
- Can this lose data? No. Only adding nullable fields and a new table.
- Can this lock large tables? Potentially, if creating the index without `CONCURRENTLY`. However, the `cases` table has very few records (currently 4 in staging/production), and index creation was removed from the standard Prisma migration.sql to be executed via `create-anti-spam-index.sql` with `CONCURRENTLY`.
- Can this break existing app code? No, all schema fields are optional/nullable.
- Can this break RLS/auth/storage? No.

### Generated files
- Migration folder: `prisma/migrations/20260706103326_triage_then_pay_flow_foundation`
- SQL file: `prisma/migrations/20260706103326_triage_then_pay_flow_foundation/migration.sql`
- Separate scripts:
  - `apps/api/src/scripts/create-anti-spam-index.sql`
  - `apps/api/src/scripts/backfill-payment-status.ts`

### Dangerous SQL found
- DROP: None
- TRUNCATE: None
- DELETE: None
- ALTER COLUMN: None
- SET NOT NULL: None
- UNIQUE: None
- FOREIGN KEY: Yes, `cases.proposed_package_id` -> `service_packages.id` (set null) and `refunds` FKs. All are on new or newly added nullable columns, hence safe.
- CASCADE: Yes, `onDelete: Cascade` on `refunds.case_id`. Since refunds is a new empty table, this is safe.

### Required checks before deploy
- Check 1: Count of cases: `SELECT COUNT(*) FROM cases;` (verified small: 4)
- Check 2: Count of `pending_verification` cases to backfill: `SELECT COUNT(*) FROM cases WHERE payment_status = 'pending_verification';`
- Check 3: Count of free `paid` cases to convert: `SELECT COUNT(*) FROM cases WHERE payment_status = 'paid' AND locked_price = 0;`

### Backup status
- Backup required: Yes, before running on production
- Backup confirmed by human: Pending
- Restore tested: Local migration applied successfully

### Deploy command for human
```bash
# 1. Apply Schema Migrations
npx prisma migrate deploy --schema prisma/schema.prisma

# 2. Create index concurrently on prod (run directly on database via psql or Supabase SQL editor)
# psql -d "$DIRECT_URL" -f apps/api/src/scripts/create-anti-spam-index.sql

# 3. Run backfill script
# Cwd: apps/api
# npx tsx src/scripts/backfill-payment-status.ts
```

### Rollback strategy
- Rollback possible: Yes, restore from Supabase backup and revert app code.
- Rollback steps:
  1. Revert app code commit.
  2. Restore database from pre-migration backup.
- Data recovery needed: None, if restored.
