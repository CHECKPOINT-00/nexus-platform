# Phase 01: schema-migration-backfill

## Context links
- Parent plan: [plan.md](./plan.md)
- Source plan: `../260703-1352-price-locking-audit-trail/plan.md`
- Research: `./research/researcher-01-backend-schema-report.md`
- Docs: `../../docs/codebase-summary.md`, `../../docs/code-standards.md`, `../../docs/system-architecture.md`, `../../docs/project-overview-pdr.md`

## Parallelization Info
- Runs alone first.
- Must finish before Phase 02 and Phase 03.
- No parallel file overlap allowed.

## Overview
- Date: 2026-07-03
- Description: Add schema support for case-level locked price and package last-change metadata. Prepare migration/backfill baseline.
- Priority: P2
- Implementation status: completed
- Review status: completed

## Key Insights
- Current system snapshots price too late at payment upload.
- Schema needs additive nullable fields for backward compatibility.
- Legacy unpaid/rejected cases cannot be perfectly reconstructed.
- <!-- Updated: Validation Session 1 - legacy backfill policy --> Legacy cases without payment history use current package price as explicit approximation, not exact historical reconstruction.

## Requirements
- Add `locked_price` to `Case`.
- Add `previous_price`, `last_price_changed_at`, `last_price_changed_by` to `ServicePackage`.
- Generate migration and regenerate Prisma client.
- Define one-time backfill path for existing rows.

## Architecture
- Data model remains package catalog + case snapshot.
- `ServicePackage.price` stays live catalog price.
- `Case.locked_price` becomes immutable snapshot written at case creation.

## Related code files
- Modify: `prisma/schema.prisma`
- Create/update: migration files under `prisma/migrations/`
- Create/update: any Prisma generated artifacts required by repo workflow

## File Ownership
- `prisma/schema.prisma`
- migration files generated for this change under `prisma/`
- no app-layer files

## Implementation Steps
1. Add nullable schema fields.
2. Generate named migration.
3. Review SQL for additive columns only.
4. Regenerate Prisma client.
5. Prepare backfill command/script notes or migration-safe data patch path.
6. Verify no `cases` rows with `package_id` but null `locked_price` after backfill.

## Todo list
- [x] Add `Case.locked_price`
- [x] Add package metadata fields
- [x] Generate migration
- [x] Regenerate Prisma client
- [x] Backfill existing data
- [x] Verify backfill counts

## Success Criteria
- Migration adds required columns without breaking existing records.
- Prisma client compiles with new fields.
- Existing cases with package relation end with non-null `locked_price` after backfill.

## Conflict Prevention
- Phase owns all Prisma schema/migration artifacts exclusively.
- No API/frontend edits in this phase.
- Downstream phases consume new fields only after this phase lands.

## Risk Assessment
- Backfill approximation for legacy unpaid/rejected cases may differ from historical truth.
- Migration conflicts possible if other uncommitted schema edits exist.

## Security Considerations
- `last_price_changed_by` stores admin id only. No secret data added.
- Migration must avoid destructive SQL.

## Next steps
- Hand off completed schema contract to Phase 02 and Phase 03.
