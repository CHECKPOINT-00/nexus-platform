# Phase 06 — Security hardening

## Context links
- [Parent plan](./plan.md)
- [Security review report](./reports/security-review.md)
- [Phase 01 — Backend contract and domain model](./phase-01-backend-contract-and-model.md)
- [Phase 02 — Schema migration and data backfill](./phase-02-schema-migration.md)
- [Phase 03 — API assembly and compatibility projections](./phase-03-api-assembly-and-compatibility.md)
- [Phase 04 — Workspace IA and UI refactor](./phase-04-workspace-ia-and-ui-refactor.md)

## Overview
- Date: 2026-06-30
- Priority: P1
- Implementation status: pending
- Review status: pending
- Goal: implement the three write/read invariants and three verifications identified in the security review so the generalized document model is not less safe than the legacy URL-blob model it replaces.

## Key Insights
- the security review flagged 3 High findings, all rooted in current code patterns the refactor will amplify
- URL safety is currently an output-only concern; revision path accepts any non-empty string as `file_url`
- no field-allowlist habit exists; raw request bodies are persisted wholesale
- `getCaseDetailUseCase` reimplements authz inline instead of calling `requireCaseAccess`, creating two divergent authz paths
- the three invariants must be settled in Phase 01 before schema/DTO work, implemented across Phase 02/03, and verified in Phase 05

## Requirements
### Functional
- enforce URL scheme + host allowlist on every document URL write field before persistence (VULN-001)
- define and enforce a client-writable vs server-derived field allowlist for document write DTOs (VULN-002)
- funnel all document read/write authorization through `requireCaseAccess` and scope document queries by `case_id` (VULN-003)
- resolve the three Needs-Verification items: full `case` object exposure, Cloudinary signed-URL policy, download mechanism SSRF risk

### Non-functional
- no security regression versus legacy URL-blob model
- controls are centralized, not duplicated across usecases
- fail closed on cross-case / orphan rows rather than silently including them

## Architecture
### Three controls
1. **Write-side URL validation**: `new URL()` + `protocol ∈ {http:, https:}` + per-`source_kind` host allowlist, applied to all array entries
2. **Write-field allowlist**: typed input DTOs that omit server-derived fields (`uploaded_by_auth_user_id`, `is_primary`, `seq`, `source_kind`, `cloudinary_public_id`, `checkpoint_id`, `lifecycle_unit_id`)
3. **Single authz chokepoint + `case_id`-scoped reads**: route through `requireCaseAccess`, query `where: { case_id }`, fail closed on mismatch

## Related code files
- `apps/api/src/modules/cases/application/submit-revision.usecase.ts`
- `apps/api/src/modules/cases/http/cases.schema.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/cases/application/cases.dto.ts`
- `apps/api/src/shared/infrastructure/authorization.ts`
- `apps/web-1/app/dashboard/case/[id]/_components/TabIdeaContent.tsx`

## Implementation Steps
1. add shared URL validator helper (`validateDocumentUrl(url, sourceKind)`) with scheme + host allowlist
2. wire URL validator into create-case and submit-revision write paths, covering all `documents[]` entries and both `drive_url`/`file_url`
3. define typed document write input DTOs that omit server-derived fields; replace raw `readJsonBody` casts
4. derive `uploaded_by_auth_user_id` from session, `is_primary`/`seq` server-side, `source_kind` from upload channel, `cloudinary_public_id` server-assigned, `checkpoint_id`/`lifecycle_unit_id` from path params re-verified against the authorized case
5. route `getCaseDetailUseCase` through `requireCaseAccess`; remove inline authz duplicate
6. scope all document-tree queries with `where: { case_id: <authorizedCaseId> }`; fail closed + audit any row whose `case_id` ≠ authorized case
7. investigate `findCaseByIdWithAllRelations` return shape; add response-field allowlist to case detail DTO (VERIFY-001)
8. decide Cloudinary URL policy: signed short-TTL for non-public documents (VERIFY-002)
9. decide download mechanism: prefer client redirect with scheme-validated URLs; if proxy required, add private-IP + redirect blocking (VERIFY-003)
10. add tests for `javascript:`/`data:` rejection, mass-assignment rejection, and cross-case row drop

## Todo List
- [ ] build `validateDocumentUrl` helper with per-`source_kind` host allowlist
- [ ] cover all `documents[]` entries + `file_url` in create-case and revision validation
- [ ] define client-writable field allowlist per role for document write DTOs
- [ ] remove server-derived fields from request binding
- [ ] consolidate `getCaseDetailUseCase` authz through `requireCaseAccess`
- [ ] add `case_id`-scoped document query + fail-closed mismatch handling
- [ ] audit `findCaseByIdWithAllRelations` fields and add response allowlist
- [ ] decide signed-URL policy for non-public Cloudinary documents
- [ ] decide download mechanism (redirect vs proxy) with SSRF mitigation
- [ ] add security regression tests for the 3 VULN classes

## Success Criteria
- `javascript:`/`data:` URLs rejected on every document write path
- server-derived fields cannot be set from request body
- no document row from another case can appear in an authorized case's response
- download mechanism has no SSRF surface
- legacy authz duplicate removed; single chokepoint enforced

## Risk Assessment
- tightening URL validation may reject existing legacy rows during backfill — handle in quarantine path (Phase 02)
- removing fields from DTOs may break current frontend submissions — coordinate with Phase 04
- signed-URL change may break cached links — plan migration window

## Security Considerations
- this phase IS the security considerations for the refactor; track via [security review report](./reports/security-review.md)
- invariants here gate Phase 02 schema work and Phase 03 API assembly

## Next Steps
- settle the three invariants in Phase 01 decision log
- implement controls alongside Phase 02/03 code
- verify in Phase 05 validation matrix

