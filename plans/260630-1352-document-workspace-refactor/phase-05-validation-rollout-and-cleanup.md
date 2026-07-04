# Phase 05 — Validation, rollout, and cleanup

## Context links
- [Parent plan](./plan.md)
- [Phase 02](./phase-02-schema-migration.md)
- [Phase 03](./phase-03-api-assembly-and-compatibility.md)
- [Phase 04](./phase-04-workspace-ia-and-ui-refactor.md)
- [Scout report](./reports/scout-report.md)

## Overview
- Date: 2026-06-30
- Priority: P2
- Implementation status: pending
- Review status: pending
- Goal: validate migrated data and new UI safely, roll out in controlled fashion, then remove dead legacy paths only after confidence is high.

## Key Insights
- compatibility is mandatory; old and new shapes will coexist for some time
- tests must cover migrated and unmigrated cases
- cleanup too early creates high regression risk

## Requirements
### Functional
- verify old and new workspace paths both work during transition
- validate authorization, loading, open/download actions, and artifact visibility
- define rollback/fallback path
- identify safe point for legacy code removal
- validate rerun-safe migration behavior and mixed migrated/unmigrated case assembly
- validate malformed legacy rows, orphan links, and sparse numbering do not silently corrupt output
- validate storage-success/model-write-failure rollback path before cutover

### Non-functional
- rollout observable and reversible enough
- failures must be diagnosable from logs/tests
- cleanup should only happen after data and UI confidence checks pass

## Architecture
### Rollout strategy
- additive backend release
- migration/backfill validation
- new UI switch
- parallel compatibility period
- legacy cleanup after acceptance

### Validation matrix
- legacy-only case
- partially migrated case
- fully migrated case
- mixed migrated + unmigrated artifacts in same case
- malformed legacy JSON row
- zero-checkpoint and multi-checkpoint case shape
- sparse/malformed version numbering case
- student access
- supporter access
- admin/triage access where relevant
- broken/expired Drive URL
- Cloudinary-disabled or partially configured environment
- storage upload success + normalized write failure simulation
- migration rerun / duplicate-prevention rehearsal

## Related code files
- `apps/api/src/shared/infrastructure/authorization.ts`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`
- `apps/api/src/shared/infrastructure/tests/api.test.ts`

## Implementation Steps
1. add backend tests for new and legacy response shapes
2. add migration validation checks, including rerun and duplicate-prevention checks
3. add malformed-row, orphan-link, and sparse-numbering validation cases
4. add UI smoke/regression tests for student and supporter surfaces
5. verify open/download behavior for Drive and Cloudinary sources, including broken-link UX
6. define rollback strategy if backfill, storage integration, or UI cutover fails
7. rehearse storage-upload-success + normalized-write-failure compensation path
8. remove dead components/legacy fields only after confidence threshold

## Todo List
- [ ] create migrated/unmigrated sample matrix
- [ ] add malformed-row and multi-checkpoint samples
- [ ] test auth and visibility rules
- [ ] test mixed Drive/Cloudinary source rendering
- [ ] test broken-link and expired-link behavior
- [ ] verify supporter review page still works
- [ ] rehearse rerun-safe migration and duplicate-prevention flow
- [ ] define cleanup checklist for dead code

## Success Criteria
- migrated and legacy cases both load correctly during rollout
- no access-control regressions
- new document manager works with Drive and Cloudinary-backed records
- dead legacy code removable with confidence after validation

## Risk Assessment
- hidden old consumer breaks after additive response changes
- rollout reveals malformed migrated units not caught in dev
- cleanup removes fallback too early

## Security Considerations
- rollout must not widen document access scope
- logs and test fixtures must avoid leaking sensitive file URLs
- cleanup must not remove auth checks bundled in legacy code paths

## Next Steps
- finalize test matrix
- schedule rollout gates
- define final deprecation path for `idea/report` legacy surfaces
