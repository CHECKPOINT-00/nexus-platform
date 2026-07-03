# Phase 03: package-metadata-backend

## Context links
- Parent plan: [plan.md](./plan.md)
- Depends on: `./phase-01-schema-migration-backfill.md`
- Research: `./research/researcher-01-backend-schema-report.md`
- Source plan: `../260703-1352-price-locking-audit-trail/phase-02-backend-logic-fixes.md`

## Parallelization Info
- Can run in parallel with Phase 02 after Phase 01 completes.
- Must finish before Phase 04 admin metadata display.
- No file overlap with Phase 02.

## Overview
- Date: 2026-07-03
- Description: Store and expose latest package price-change metadata in admin/package backend path.
- Priority: P2
- Implementation status: completed
- Review status: completed

## Key Insights
- Current admin price update writes new price only.
- Existing admin UI hook reads `/packages`, so payload exposure strategy matters.
- Scope is latest-change metadata only, not full audit history table.

## Requirements
- Capture previous price, changed timestamp, and admin id when package price changes.
- Thread authenticated admin id from controller into use case.
- Persist metadata alongside updated package price.
- Expose metadata fields in response shape used by admin UI.
- <!-- Updated: Validation Session 1 - actor scope --> Expose raw authenticated admin id only for `last_price_changed_by`; no display-name expansion in this scope.

## Architecture
- Package update flow remains synchronous request/response.
- Audit state stored on `ServicePackage` row as last-change metadata.
- No historical table, no per-case propagation from this phase.

## Related code files
- `apps/api/src/modules/admin/application/update-package-price.usecase.ts`
- `apps/api/src/modules/admin/http/admin.controller.ts`
- `apps/api/src/modules/admin/http/admin.routes.ts`
- `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts`

## File Ownership
- `apps/api/src/modules/admin/application/update-package-price.usecase.ts`
- `apps/api/src/modules/admin/http/admin.controller.ts`
- `apps/api/src/modules/admin/http/admin.routes.ts`
- `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts`

## Implementation Steps
1. Confirm admin identity source in controller/auth context.
2. Extend controller payload handling to pass `adminId`.
3. Update use case to load current package and compute metadata.
4. Extend package repository update method to persist `previous_price`, `last_price_changed_at`, `last_price_changed_by`.
5. Ensure response payload includes new metadata fields for package consumers.
6. Run targeted backend tests for admin package update path and package listing/detail payloads.

## Todo list
- [x] Pass admin id from controller to use case
- [x] Compute previous/current price metadata
- [x] Persist latest-change metadata
- [x] Expose metadata in API response/package payload
- [x] Add/adjust focused backend tests

## Success Criteria
- Admin price update stores previous price.
- Admin price update stores timestamp and actor id.
- Package payload returned to UI includes latest-change metadata.
- No claim of full audit history appears in code or response naming.

## Conflict Prevention
- Phase owns admin/package backend files exclusively.
- Must not touch case creation, case detail, or payment upload files.
- Keep metadata naming additive and scoped to latest change only.

## Risk Assessment
- These files already have working-tree changes; merge discipline needed.
- Admin identity extraction may differ from existing assumptions in controller.
- If `/packages` response is shared beyond admin, additive fields must stay harmless.

## Security Considerations
- Trust admin id from authenticated backend context only.
- Do not accept actor id from client body.
- Preserve admin authorization gates on price update route.

## Next steps
- Hand metadata payload contract to Phase 04 admin UI.
- Join final backend regression pass with Phase 02 outputs.
