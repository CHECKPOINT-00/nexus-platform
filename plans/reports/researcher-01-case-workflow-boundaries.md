---
name: researcher-01-case-workflow-boundaries
description: Backend case workflow boundaries for MVP demo realignment
metadata:
  type: reference
---

Backend case/admin/supporter boundary map.

## Core backend files to own
- `apps/api/src/modules/cases/domain/case.types.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/cases/application/update-case-status.usecase.ts`
- `apps/api/src/modules/admin/http/admin.controller.ts`
- `apps/api/src/modules/admin/application/admin.dto.ts`
- `apps/api/src/modules/supporter/http/supporter.controller.ts`

## Demo-critical contract boundaries
1. `admin.dto.ts` must keep `assigned_supporter` and `internal_status` stable.
2. `case.types.ts` is authority for legal stage transitions.
3. `AdminCaseAssignmentTable.tsx` assumes three internal-status buckets.
4. Admin/supporter controllers define request body keys the demo UI depends on.

## Parallel-safe phase splits
- Phase 01: backend workflow core
- Phase 02: admin triage API
- Phase 03: supporter workflow API
- Phase 04: admin UI contract alignment

## Unresolved questions
- Whether `update-case-status.usecase.ts` is sole writer of `user_facing_stage`.
- Whether admin accept maps to `accepted_unassigned` or another internal transition.
- Whether `closeCaseUseCase` uses shared transition table or bypasses it.
- Whether admin list endpoint filters by both stage and internal_status.
