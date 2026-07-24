# Phase 02 — Build shared post-intake upload pipeline

## Context links
- Parent plan: `./plan.md`
- Backend scout: `./research/researcher-01-backend-scout-report.md`
- Payment proof reference: `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts:28`
- Document contract: `apps/api/src/modules/documents/domain/document-contract.ts:43`

## Overview
- Date: 2026-07-01
- Description: Extract one shared server-side pipeline for Cloudinary-backed document uploads after intake.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Payment proof already proves upload-first, DB-fail rollback pattern.
- Document workspace contract already expects source-aware file metadata.
- Revision repository already knows how to attach documents to lifecycle units.

## Requirements
- Accept multipart file inputs for post-intake flows.
- Upload to Cloudinary before DB persistence.
- Derive metadata server-side: file URL, download URL, original name, extension, mime type, cloudinary public id, source kind.
- Delete uploaded asset if downstream DB write fails.
- Centralize MIME/size allowlist helpers per flow.
- <!-- Updated: Validation Session 1 - external-feedback file policy --> Lock document lifecycle allowlist to `pdf`, `docx`, `xlsx`, `pptx`, `md`, `txt`; keep payment proof image-only in its separate flow.

## Architecture
- Add documents application service like `uploadManagedDocumentFile(...)`.
- Service responsibilities:
  - validate raw file presence/size/MIME
  - upload to Cloudinary using shared service
  - return normalized metadata object
  - expose cleanup callback or public id for rollback
- Each use case wraps DB write in try/catch and deletes uploaded asset on failure.
- Keep payment proof helper isolated; extract only common Cloudinary utility if reuse is clean.

## Related code files
- Modify/create: `apps/api/src/modules/documents/application/**`
- Modify/create: `apps/api/src/modules/documents/infrastructure/**`
- Modify/create: `apps/api/src/services/cloudinary*`
- Modify/reference: `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts`

## Implementation Steps
1. Locate current Cloudinary upload helper used by payment proof.
2. Extract common metadata mapping without merging payment domain semantics.
3. Define normalized uploaded-document metadata shape for document module.
4. Add flow-specific file rule helpers for revision/output/external-feedback uploads.
5. Implement cleanup-on-fail wrapper and test it directly.
6. Document expected multipart field names for controller integration.
7. Document that `assessment_units` are technical grouping containers for external evaluation artifacts, not Nexus-owned assessment rounds.

## Todo list
- [ ] Identify reusable Cloudinary helper boundaries.
- [ ] Add shared upload metadata mapper.
- [ ] Add file rule validators.
- [ ] Add rollback helper on DB failure.
- [ ] Add typed return shape for uploaded document metadata.
- [ ] Prepare controller integration notes for Phases 03 and 04.

## Success Criteria
- One reusable pipeline exists for post-intake uploads.
- DB failure deletes uploaded Cloudinary asset.
- Flow-specific validators can enforce MIME and size policies.
- Payment proof behavior remains isolated and unchanged.

## Risk Assessment
- Over-sharing helper with payments can entangle domains.
- Multipart parser/file object types may differ by route layer.
- Signed vs unsigned Cloudinary URL behavior may affect `download_url` semantics.

## Security Considerations
- Enforce allowlists before upload where possible.
- Never trust client MIME blindly; inspect file metadata from parser.
- Ensure Cloudinary folder/public-id strategy avoids collisions and leaks.

## Next steps
- Plug pipeline into revision write path in Phase 03.
- Reuse same pipeline for supporter output and evidence in Phase 04.
