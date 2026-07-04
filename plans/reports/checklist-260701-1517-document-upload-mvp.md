# Document upload MVP checklist

## Decisions locked
- Intake/create-case keeps `url-based` document refs only.
- Post-intake flows use `file-based` upload only.
- File-based uploads store in Cloudinary.
- Upload must succeed first, then write DB record.
- Payment proof stays separate, image-only upload flow.
- Post-intake UI uses modal actions for clean workspace UX.
- Canonical `document_types` move to DB-backed master data.

## A. API / file contract
- [ ] Keep intake/create-case request URL-based only.
- [ ] Design multipart upload contract for post-intake document flows.
- [ ] Reuse payment-proof multipart parsing pattern where possible.
- [ ] Define upload response payload: `file_url`, `download_url`, `original_name`, `extension`, `mime_type`, `cloudinary_public_id`, `source_kind`.
- [ ] Define revision file-submit endpoint.
- [ ] Define supporter output file-submit endpoint.
- [ ] Define supporter/admin evidence file-submit endpoint.
- [ ] Add role/stage guards per endpoint.
- [ ] Add file size + mime allowlists per flow.

## B. document_types master data
- [ ] Create `document_types` table.
- [ ] Add fields: `code`, `label`, `direction`, `unit_scope`, `is_active`, `sort_order`.
- [ ] Seed full canonical list from `docs/case-documents/NEXUS_DOCUMENT_SYSTEM_COMPLETE_SPEC.md`.
- [ ] Add migration plan from current hardcoded document types.
- [ ] Keep `document_records.doc_type` as string code for MVP.
- [ ] Change backend validation to check DB-backed active types.
- [ ] Add read API for document type options.
- [ ] Filter type options by role + flow + unit scope if needed.

## C. Write-flow mapping
- [ ] Split write modes clearly:
  - intake = URL reference mode
  - post-intake = managed file mode
- [ ] Implement upload-first, persist-second flow.
- [ ] If DB write fails after upload, delete uploaded Cloudinary asset.
- [ ] Centralize Cloudinary upload helper for document files.
- [ ] Derive server-side metadata after upload.
- [ ] Map uploaded asset into unified `document_records` shape.
- [ ] Keep URL validation path only for intake.
- [ ] Avoid mixed file/url payloads in same post-intake endpoint.

## D. UI shape
- [ ] User revision submit uses modal with file upload.
- [ ] Supporter output upload uses modal.
- [ ] Supporter/admin evidence upload uses modal.
- [ ] Replace free-text doc type input with select options from API.
- [ ] Show upload status/error clearly in modal.
- [ ] Refresh document workspace after successful submit.

## E. Payment proof cleanup
- [ ] Keep payment proof logic isolated from document module.
- [ ] Restrict payment proof to image mime types only.
- [ ] Remove PDF support from payment proof if still allowed.
- [ ] Keep dedicated storage folder/rules for payment proofs.

## F. Backend implementation targets
- [ ] Add/adjust Prisma migration for `document_types`.
- [ ] Add seed/update script for canonical document types.
- [ ] Add document upload service/usecase for file-based flows.
- [ ] Extend revision usecase to accept uploaded-file metadata path.
- [ ] Add supporter output write usecase.
- [ ] Add evidence write usecase.
- [ ] Add controller/routes for new endpoints.
- [ ] Add validation helpers for flow-specific file rules.

## G. Migration / compatibility
- [ ] Keep old intake URL-based behavior working.
- [ ] Migrate hardcoded canonical lists out of validation logic.
- [ ] Map old generic types to new canonical codes where possible.
- [ ] Backfill existing records only if needed for workspace correctness.
- [ ] Document non-migrated legacy records/rules explicitly.

## H. Tests
- [ ] Unit test document type validation against DB-backed types.
- [ ] Unit test upload-first / DB-fail cleanup behavior.
- [ ] Integration test revision file upload.
- [ ] Integration test supporter output file upload.
- [ ] Integration test evidence file upload.
- [ ] Integration test forbidden role/stage cases.
- [ ] Integration test intake URL path still works.
- [ ] Integration test payment proof image-only guard.

## Suggested order
1. `document_types` table + seed + read API
2. file-upload helper + Cloudinary cleanup-on-fail path
3. revision file-upload flow
4. supporter output flow
5. evidence flow
6. UI modals + selects
7. tests + migration cleanup
