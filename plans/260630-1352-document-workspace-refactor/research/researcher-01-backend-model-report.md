# Researcher 01 — Backend document model

## Scope
- inspect Prisma + case/report persistence
- identify gaps for `Case -> Checkpoint -> Lifecycle Unit -> File`
- note Cloudinary fit

## Verified findings
1. No first-class file/document table in Prisma.
   - `prisma/schema.prisma:122-327`
   - file-like refs scattered in scalar fields: `LifecycleUnit.file_url`, `Report.document_id`, `CaseEvent.document_id`, `Payment.proof_file_url`.

2. Intake + revision persist documents as JSON/blob, not records.
   - create case stores raw body in lifecycle unit content: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:188-198`
   - revision stores `{ change_summary, documents, remaining_blockers }` in `content`, then copies only first document URL into `file_url`: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:387-400`

3. API contracts still assume URL-only docs.
   - intake/revision DTOs accept `drive_url` / `file_url`: `apps/api/src/modules/cases/application/cases.dto.ts:23-36`
   - revision validation only checks URL strings: `apps/api/src/modules/cases/application/submit-revision.usecase.ts:66-93`

4. Case detail response is shaped for old UI, not document manager.
   - `document_board_sections` = `team_submissions`, `nexus_reports`, `team_revisions`
   - `round_history` maps reports onto lifecycle units by `version_no`
   - `apps/api/src/modules/cases/application/get-case-detail.usecase.ts:59-91`

5. `LifecycleUnit` semantics are mixed.
   - first intake created as `unit_code: "v00"`, `unit_type: "intake"`, `version_no: 1`: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:188-198`
   - revisions created as `unit_code: v0{nextVersion}`, `unit_type: "revision"`: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:387-400`
   - spec wants canonical unit families: `vNN` and `aNN-vNN`.

6. No write path for assessment units.
   - no repo/usecase found creating `aNN-vNN`
   - current feedback/report flow lives in reports + events, not lifecycle units.

7. Cloudinary helps storage, not document semantics.
   - app still needs DB record for business metadata: lifecycle unit, direction, doc_type, primary flag, source kind, uploader, cloudinary ids/urls.

## Planning implications
- add normalized document record model before serious UI refactor
- preserve legacy intake snapshot only as migration/fallback
- reshape `GET /cases/:id` around checkpoints, units, files
- define migration policy for Drive URL docs vs Cloudinary-managed docs

## Suggested minimum model
- `lifecycle_units` keep checkpoint/version/assessment ownership
- add document table linked to `case_id`, `checkpoint_id`, `lifecycle_unit_id`
- document fields: `direction`, `doc_type`, `seq`, `is_primary`, `source_kind`, `file_url`, `download_url`, `cloudinary_public_id`, `original_name`, `canonical_name`, `mime_type`, `extension`, `uploaded_by_auth_user_id`

## Risks
- schema rewrite touches case create, revision submit, supporter outputs, report artifacts
- old UI and tests rely on `content` JSON + `file_url`
- naming/unit normalization may expose bad legacy data

## Unresolved questions
- keep Drive links as first-class source long-term, or migrate all managed files to Cloudinary?
- model report artifact as file under assessment unit, or keep report row + attach file record?
