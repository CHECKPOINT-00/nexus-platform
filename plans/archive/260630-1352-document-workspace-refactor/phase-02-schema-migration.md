# Phase 02 — Schema migration and data backfill

## Context links
- [Parent plan](./plan.md)
- [Phase 01](./phase-01-backend-contract-and-model.md)
- [Backend model research](./research/researcher-01-backend-model-report.md)
- [Codebase summary](../../docs/codebase-summary.md)
- [Code standards](../../docs/code-standards.md)

## Overview
- Date: 2026-06-30
- Priority: P1
- Implementation status: pending
- Review status: pending
- Goal: add normalized schema and backfill legacy case/revision/report data without losing traceability.

## Key Insights
- intake and revision docs currently live in JSON blobs plus one `file_url`
- report/evidence relationships are not normalized under lifecycle units
- migration must preserve old columns during transition

## Requirements
### Functional
- add document record persistence
- preserve old lifecycle unit data and report rows
- backfill old intake/revision documents into normalized records
- create mapping strategy for assessment-side artifacts
- make backfill rerun-safe and deterministic
- reconstruct multi-document legacy units without collapsing to single representative URL
- detect and quarantine malformed or cross-linked legacy rows instead of silently skipping them
- define collision handling for canonical names, missing extension, and missing mime metadata

### Non-functional
- migration safe on partial failures
- verifiable against sample cases
- no silent data loss
- backward-compatible enough for staged rollout

## Architecture
### Migration strategy
- additive schema first
- backfill second
- compatibility projection third
- cleanup only after validation
- backfill uses deterministic identity key and upsert/idempotent replay rules
- malformed rows move to audit/quarantine output with operator-visible repair path
- cross-case, cross-checkpoint, and orphan-link mismatches fail validation rather than auto-merge

### Backfill sources
- `lifecycleUnit.content`
- `lifecycleUnit.file_url`
- `report` rows
- `caseEvent` metadata where needed for evidence linkage

## Related code files
- `prisma/schema.prisma`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/cases/application/submit-revision.usecase.ts`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/reports/infrastructure/persistence/report.repository.ts`

## Implementation Steps
1. add normalized document schema and relations
2. keep old columns alive for transition
3. define deterministic identity/upsert key for normalized document rows
4. write backfill rules for intake units, including multi-document reconstruction
5. write backfill rules for revision units, including duplicate URL dedupe and `is_primary`
6. write backfill rules for report/evidence artifacts and orphan linkage handling
7. add verification queries and migration audit checks
8. add quarantine/audit outputs for malformed JSON, naming collisions, and missing metadata
9. define fallback handling for malformed legacy rows
10. rehearse rerun behavior and duplicate prevention before rollout

## Todo List
- [ ] define exact migration order
- [ ] define canonical naming for backfilled records
- [ ] define naming collision resolution and missing metadata fallback
- [ ] define `is_primary` derivation rules
- [ ] define source-kind derivation rules
- [ ] define deterministic dedupe/upsert key for reruns
- [ ] define quarantine output format for malformed rows
- [ ] prepare audit script/checklist
- [ ] prepare mixed migrated/unmigrated sample matrix

## Success Criteria
- migrated cases produce stable document trees
- legacy data remains readable after migration
- malformed rows are flagged, not silently dropped

## Risk Assessment
- duplicate or ambiguous file reconstruction from old blobs
- inconsistent legacy `unit_code` / `version_no` combos
- report artifact mapping may need manual rules

## Security Considerations
- migration scripts must preserve case ownership boundaries
- stored URLs and file metadata treated as untrusted input
- logs must avoid leaking sensitive URLs in bulk

## Next Steps
- draft migration script design
- identify sample cases for validation
- prepare compatibility tests before UI switch

## Migration Task: unit_type canonical alignment (2026-07-01)

**Context:** Code hiện tại dùng 3 vocabularies song song (`intake`/`outbound`/`revision`). Spec chốt `version`/`assessment`. Cần align code + data với spec.

**Migration script:**

```sql
-- File: prisma/migrations/YYYYMMDD_HHMMSS_align_unit_type_to_spec/migration.sql

-- Step 1: Update existing rows
UPDATE "lifecycle_units"
SET "unit_type" = 'version'
WHERE "unit_type" IN ('intake', 'outbound', 'revision');

-- Step 2: Verify no orphan rows
SELECT COUNT(*) FROM "lifecycle_units"
WHERE "unit_type" NOT IN ('version', 'assessment');
-- Expected: 0

-- Step 3: Add check constraint (optional, sau khi validation)
-- ALTER TABLE "lifecycle_units"
-- ADD CONSTRAINT "lifecycle_units_unit_type_check"
-- CHECK ("unit_type" IN ('version', 'assessment'));
```

**Code changes:**
1. `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:195` — `unit_type: "intake"` → `unit_type: "version"`
2. `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:407` — `unit_type: "outbound"` → `unit_type: "version"`
3. `apps/api/src/modules/documents/application/assemble-document-workspace.ts:119` — filter `unit_type === "version"`
4. `apps/api/src/modules/cases/application/get-case-detail.usecase.ts:95-96` — filter `unit_type === "version"`
5. `apps/api/src/scripts/backfill-documents.ts:73` — map direction từ `version`/`assessment`

**Test changes:**
- `apps/api/src/shared/infrastructure/tests/phase-01-boundaries.test.ts` — đổi `unit_type: "intake"` → `unit_type: "version"`, `unit_type: "outbound"` → `unit_type: "version"`

**Rollout plan:**
1. Chạy migration SQL trên dev/staging
2. Deploy code mới
3. Verify tests pass
4. Chạy migration trên production (backup trước)
5. Monitor logs 24h

**Rollback plan:**
- Nếu có lỗi, revert code về vocab cũ (`intake`/`outbound`/`revision`)
- Data migration reversible: `UPDATE lifecycle_units SET unit_type = 'intake' WHERE unit_type = 'version' AND unit_code = 'v00'`
- Assessment units chưa có → không cần rollback

**Success criteria:**
- [ ] Migration script chạy thành công trên dev
- [ ] `npm --workspace apps/api test` pass
- [ ] No orphan rows sau migration
- [ ] Code review approved
- [ ] Deployed to production
