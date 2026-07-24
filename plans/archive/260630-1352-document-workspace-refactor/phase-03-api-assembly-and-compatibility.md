# Phase 03 — API assembly and compatibility projections

## Context links
- [Parent plan](./plan.md)
- [Phase 01](./phase-01-backend-contract-and-model.md)
- [Phase 02](./phase-02-schema-migration.md)
- [Scout report](./reports/scout-report.md)
- [System architecture](../../docs/system-architecture.md)

## Overview
- Date: 2026-06-30
- Priority: P1
- Implementation status: pending
- Review status: pending
- Goal: reshape case detail assembly around checkpoint/unit/file while preserving legacy response fields used by existing workspace surfaces.

## Key Insights
- `useCaseDetails` is main frontend seam
- current response optimized for `idea/report` tabs
- compatibility projection is mandatory to avoid breaking student/supporter pages during transition

## Requirements
### Functional
- add document-tree payload under case detail
- preserve `intake_snapshot`, `latest_report`, `document_board_sections`, `round_history` until UI migration complete
- support query/use of checkpoint overview, version units, assessment units, file metadata
- define exact field-presence, nullability, and empty-array invariants for new and legacy consumers
- prevent double counting when normalized and legacy sources coexist in same case detail response
- define source-aware metadata/URL exposure rules for Drive and Cloudinary-backed records

### Non-functional
- no access-control regressions
- additive response preferred over breaking rewrite
- payload shape remains understandable and testable

## Architecture
### New read shape
- `case`
- `document_workspace.checkpoints[]`
  - `checkpoint_code`
  - `overview`
  - `version_units[]`
  - `assessment_units[]`
- legacy compatibility fields remain computed alongside

### Compatibility strategy
- derive old fields from normalized records when possible
- fallback to legacy blobs for unmigrated rows
- phase out old fields only after UI cutover
- lock precedence rules when both normalized and legacy artifacts can answer same compatibility field
- preserve old sort/null/default semantics intentionally instead of incidentally
- reject or flag contradictory case detail assembly rather than returning silent mixed-state ambiguity

## Related code files
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/cases/http/cases.controller.ts`
- `apps/api/src/modules/cases/http/cases.routes.ts`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`

## Implementation Steps
1. define exact response DTO for document workspace
2. define `null` / `[]` / omitted invariants for every new and preserved field
3. assemble checkpoint overview from normalized records
4. assemble version unit and assessment unit lists with sparse-numbering-safe sort rules
5. add compatibility field projections
6. add precedence and dedupe logic for mixed migrated/unmigrated cases
7. add fallback logic for legacy-only cases
8. define source-aware URL exposure and open/download metadata rules
9. update frontend hook typings incrementally
10. add API tests for migrated, unmigrated, mixed, and malformed-numbering cases

## Todo List
- [ ] finalize `document_workspace` JSON shape
- [ ] lock field presence and nullability contract for preserved/new fields
- [ ] define sort order for versions and assessments
- [ ] define sparse/malformed numbering normalization rules
- [ ] define file metadata shape for UI tables
- [ ] define source-aware URL exposure rules
- [ ] define legacy fallback rules
- [ ] define mixed-state dedupe/precedence rules
- [ ] update shared TS types

## Success Criteria
- one API response can serve new document UI and old workspace consumers
- migrated and unmigrated cases both load without hard failure
- frontend types can evolve incrementally

## Risk Assessment
- payload bloat if legacy and new shapes coexist too long
- hidden assumptions in old UI around `latest_report` or `round_history`
- sorting/grouping bugs in checkpoint assembly

## Security Considerations
- checkpoint/unit/file filtering must respect case access
- do not expose hidden files through compatibility projections
- sanitize all document labels and URLs returned to clients

## Next Steps
- wire normalized repo queries
- update `useCaseDetails` types
- prepare UI refactor against additive contract
