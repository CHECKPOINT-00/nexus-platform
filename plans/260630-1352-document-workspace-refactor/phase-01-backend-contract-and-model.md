# Phase 01 — Backend contract and domain model

## Context links
- [Parent plan](./plan.md)
- [Backend model research](./research/researcher-01-backend-model-report.md)
- [Scout report](./reports/scout-report.md)
- [Document spec](../../docs/case-documents/NEXUS_DOCUMENT_SYSTEM_COMPLETE_SPEC.md)
- [System architecture](../../docs/system-architecture.md)

## Overview
- Date: 2026-06-30
- Priority: P1
- Implementation status: pending
- Review status: pending
- Goal: define normalized backend source of truth for checkpoint/unit/file document workspace before schema and UI changes.

## Key Insights
- current backend is URL/blob-centric, not file-record-centric
- lifecycle semantics exist, but mixed with `intake` / `revision` process labels
- no first-class file/document entity in Prisma
- case detail response is shaped for old workspace tabs

## Requirements
### Functional
- represent `Case -> Checkpoint -> Lifecycle Unit -> File`
- support canonical unit families `vNN` and `aNN-vNN`
- support Cloudinary-managed files and Drive URLs together
- define additive read contract for document workspace
- preserve old response fields during transition
- define checkpoint selection rules for all read/write flows; no implicit `checkpoints[0]`
- define document identity, dedupe, and `is_primary` invariants before migration starts
- define explicit report-link invariants for null/mismatched `lifecycle_unit_id` and orphan report artifacts
- define source-specific open/download/visibility behavior for Drive vs Cloudinary
- define nullability and empty-state invariants for `document_workspace` response fields

### Non-functional
- keep authorization case-scoped
- avoid destructive API rewrite in one step
- keep model queryable and indexable
- support legacy fallback projection

## Architecture
### Target domain
- Checkpoint owns many lifecycle units
- Lifecycle unit owns many document records
- document record stores business metadata, not only storage URL

### Proposed document record fields
- `case_id`
- `checkpoint_id`
- `lifecycle_unit_id`
- `direction`
- `doc_type`
- `seq`
- `is_primary`
- `source_kind`
- `canonical_name`
- `original_name`
- `extension`
- `mime_type`
- `file_url`
- `download_url`
- `cloudinary_public_id`
- `uploaded_by_auth_user_id`

### API direction
- keep legacy `GET /cases/:id` consumers alive
- add document-tree projection to case detail response
- define checkpoint overview, version units, assessment units, file rows
- lock exact invariants for `null` vs `[]` vs omitted fields so old consumers do not break on additive rollout
- lock sort and merge precedence rules when migrated and unmigrated records coexist in same case

### Backend invariants to settle before schema work
- checkpoint ownership, report linkage, and file ownership must always agree on `case_id`
- one legacy unit may map to many normalized document rows; backfill must never collapse to representative `file_url`
- duplicate legacy URLs/files must resolve through deterministic dedupe rules, not insertion order
- malformed JSON/content rows must be quarantined and auditable, not crash reads and not disappear silently
- every source kind must define stable identity handle: Drive URL/file id, Cloudinary public id, generated artifact key

## Related code files
- `prisma/schema.prisma`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/cases/application/cases.dto.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/cases/application/submit-revision.usecase.ts`
- `apps/api/src/shared/infrastructure/authorization.ts`

## Implementation Steps
1. define canonical unit semantics for `vNN` and `aNN-vNN`
2. define checkpoint selection and cardinality rules for write/read flows
3. define normalized document record model
4. define document identity, dedupe, and `is_primary` rules
5. define API read contract for document workspace, including `null` / `[]` invariants
6. define compatibility projection rules back to legacy fields
7. define mixed migrated/unmigrated merge precedence rules
8. define report artifact placement and orphan-handling rule
9. define source-kind rules for Drive vs Cloudinary vs generated files
10. define broken-link and source-specific open/download behavior

## Todo List
- [ ] confirm exact table/entity naming
- [ ] confirm report artifact strategy
- [ ] draft response JSON shape for case detail
- [ ] lock `null` / `[]` / omitted policy for every new response field
- [ ] define checkpoint selection rule for multi-checkpoint cases
- [ ] define dedupe key and `is_primary` derivation for duplicate legacy files
- [ ] draft write DTO shape for intake/revision/supporter outputs
- [ ] draft authorization matrix for document actions
- [ ] draft source behavior matrix for Drive vs Cloudinary open/download/visibility
- [ ] define quarantine rule for malformed legacy rows

## Success Criteria
- normalized model covers current intake, revision, report, evidence cases
- API contract can serve both new UI and old fallback consumers
- unit semantics no longer rely on mixed legacy labels

## Risk Assessment
- over-modeling before migration details settled
- conflict between old report model and new assessment unit model
- hidden consumers of legacy fields

## Security Considerations
- every document read/write tied to case access checks
- file metadata sanitized before persistence
- no cross-case leakage through unit/file joins

## Next Steps
- finalize Prisma additions
- prepare migration and backfill rules
- align on response contract before persistence code changes

## Decision Log

### unit_type canonical vocabulary (2026-07-01)

**Decision:** Align code với spec — `version` / `assessment`.

**Rationale:**
- Spec (`NEXUS_DOCUMENT_SYSTEM_COMPLETE_SPEC.md`) đã chốt: `vNN` = version, `aNN-vNN` = assessment.
- `intake`/`outbound`/`revision` là legacy labels, không rõ nghĩa.
- `version` cover cả intake + revisions (đều là version submissions).
- `assessment` rõ nghĩa hơn `outbound` (outbound = gì? report? feedback? revision?).
- Spec là source of truth. Code nên align với spec.

**Current state (before migration):**
- Write: `case.repository.ts:195` tạo intake với `unit_type: "intake"`, `unit_code: "v00"`
- Write: `case.repository.ts:407` tạo revision với `unit_type: "outbound"`, `unit_code: v0{nextVersion}`
- Read: `assemble-document-workspace.ts:119` filter `intake` | `revision` → **bug C1: drop outbound units**
- Read: `get-case-detail.usecase.ts:95-96` filter `intake` | `revision`
- Backfill: `backfill-documents.ts:73` map `intake` → `inbound`, else → `outbound`

**Target state (after migration):**
- Intake: `unit_type: "version"`, `unit_code: "v00"`, `version_no: 1`
- Revision: `unit_type: "version"`, `unit_code: v0{next}`, `version_no: next`
- Report artifact (future): `unit_type: "assessment"`, `unit_code: aNN-vNN`
- Filter: `unit_type === "version"` cho version units, `unit_type === "assessment"` cho assessment units

**Migration steps:**
1. Update `case.repository.ts:195` — intake → `unit_type: "version"`
2. Update `case.repository.ts:407` — revision → `unit_type: "version"`
3. Update `assemble-document-workspace.ts:119` — filter `unit_type === "version"`
4. Update `get-case-detail.usecase.ts:95-96` — filter `unit_type === "version"`
5. Update `backfill-documents.ts:73` — map direction từ `version`/`assessment`
6. Update tests: `phase-01-boundaries.test.ts` — đổi `intake`/`outbound` → `version`
7. Data migration: `UPDATE lifecycle_units SET unit_type = 'version' WHERE unit_type IN ('intake', 'outbound', 'revision')`
8. Assessment units (future phase) → `unit_type: "assessment"`, `unit_code: aNN-vNN`

**Todo:**
- [x] Decision logged (2026-07-01)
- [ ] Add migration task to phase-02
- [ ] Update code (case.repository.ts, assemble-document-workspace.ts, get-case-detail.usecase.ts, backfill-documents.ts)
- [ ] Update tests (phase-01-boundaries.test.ts)
- [ ] Run `npm --workspace apps/api test` — expect pass
- [ ] Document in code-review.md as resolved

**Risk:**
- Data migration cần chạy trước khi deploy code mới.
- Nếu có production data, cần backup trước khi UPDATE.
- Assessment units chưa implement → để phase sau.
