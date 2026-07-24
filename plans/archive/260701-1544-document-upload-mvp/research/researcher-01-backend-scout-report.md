# Backend scout report — document upload MVP

## Sources
- `plans/reports/brainstorm-260701-1517-document-upload-mvp-summary.md`
- `plans/reports/checklist-260701-1517-document-upload-mvp.md`
- `apps/api/src/modules/cases/application/submit-revision.usecase.ts:55`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:377`
- `apps/api/src/modules/documents/application/validate-document-write.ts:19`
- `apps/api/src/modules/documents/domain/document-contract.ts:1`
- `apps/api/src/modules/documents/domain/document-types.ts:9`
- `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts:28`
- `apps/api/src/modules/cases/application/cases.dto.ts:30`

## Current state
- Revision submit already exists, but still URL/file hybrid payload through `documents` array.
- Validation currently accepts `file_url` or `drive_url`, then derives source kind from URL.
- Revision persistence already creates new lifecycle unit and document records in one transaction.
- Document workspace read contract already supports `cloudinary` source kind and `document_workspace` additive payload.
- Payment proof already has upload-first then DB-write, with Cloudinary cleanup on DB failure.

## Reuse candidates
- Reuse payment upload pattern for upload-first + rollback: `upload-payment-proof.usecase.ts:28`.
- Reuse revision stage/member guards in `submit-revision.usecase.ts:55`.
- Reuse existing `createDocumentRecordsForUnit(...)` path in repository layer from `case.repository.ts:418`.
- Reuse document workspace source behavior model in `document-contract.ts:43` and `document-types.ts:50`.

## Likely touch points
- Prisma schema + migration for `document_types` table.
- Seed script for canonical document types.
- Cases DTO/controller for multipart revision upload contract.
- New document upload application service around Cloudinary metadata derivation.
- New supporter output and evidence use cases/routes.
- Validation layer split: intake URL path vs post-intake managed upload path.
- Document type read API for frontend selects.

## Constraints
- Intake/create-case must stay URL-based for backward compatibility.
- Post-intake must not accept mixed URL/file payload.
- Current revision repository generates `unit_code` as `v0${nextVersion}`; works for single digits only, so plan should verify formatting before scaling version count.
- Existing document domain enums still hardcode generic types; DB-backed type source must avoid half-migrated validation.

## Risks
- Multipart handling likely lives in controller layer, so contract split may ripple across route parsing.
- Evidence flow needs explicit rule for creating/finding `aNN-vNN` assessment unit; not locked yet.
- Supporter/admin permissions for evidence upload can drift if copied from review/admin flows without shared guard.
- Existing transaction writes uploaded metadata plus document records; helper boundary must keep cleanup reliable.

## Open questions
- Exact multipart parser already used in payment controller path?
- Whether `document_records.doc_type` currently stores labels or stable codes in old data?
- Whether supporter output should also create/update report artifact rows or remain document-only in MVP?
