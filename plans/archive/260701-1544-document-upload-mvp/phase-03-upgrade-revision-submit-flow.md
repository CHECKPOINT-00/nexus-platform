# Phase 03 — Upgrade revision submit flow

## Context links
- Parent plan: `./plan.md`
- Current modal: `apps/web-1/app/dashboard/case/[id]/_components/RevisionSubmitModal.tsx:15`
- Current hook: `apps/web-1/app/dashboard/case/[id]/hooks/useCaseRevision.ts:4`
- Current use case: `apps/api/src/modules/cases/application/submit-revision.usecase.ts:55`
- Current repository write: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:377`

## Overview
- Date: 2026-07-01
- Description: Convert revision submit from Drive-link payload to managed file upload while preserving stage and membership guards.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Revision submit guard logic already exists and should be preserved.
- Current write path creates next revision lifecycle unit and event in one transaction.
- Frontend already uses modal UX and query invalidation.

## Requirements
- Student/member can upload revision files via multipart endpoint.
- Revision submit still requires `change_summary` and optional `remaining_blockers`.
- User chooses document type from API options, not free text.
- Server persists normalized file metadata as revision documents.
- Workspace refreshes after success.

## Architecture
- Replace JSON `/cases/:id/revisions` request with multipart-compatible controller path or sibling endpoint.
- Use shared upload pipeline from Phase 02.
- Use existing stage/member guards from `submitRevisionUseCase`.
- Keep repository transaction semantics, but consume server-derived file metadata instead of raw Drive links.
- Confirm `unit_code` formatting logic handles version 10+ correctly before freezing implementation.

## Related code files
- Modify: `apps/api/src/modules/cases/application/submit-revision.usecase.ts`
- Modify: `apps/api/src/modules/cases/application/cases.dto.ts`
- Modify: `apps/api/src/modules/cases/http/*`
- Modify: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- Modify: `apps/web-1/app/dashboard/case/[id]/hooks/useCaseRevision.ts`
- Modify: `apps/web-1/app/dashboard/case/[id]/_components/RevisionSubmitModal.tsx`
- Possibly create: shared frontend upload helper/hook under case workspace

## Implementation Steps
1. Finalize multipart contract for revision submit.
2. Update controller to parse file + metadata fields.
3. Integrate shared upload pipeline and DB rollback path.
4. Preserve current stage/member checks.
5. Replace modal URL inputs with file picker + document type select + description field.
6. Return success payload compatible with existing query invalidation.
7. Verify document workspace displays new Cloudinary-backed revision records.

## Todo list
- [ ] Define revision multipart fields.
- [ ] Update revision DTO/controller.
- [ ] Integrate upload pipeline in use case.
- [ ] Fix/verify lifecycle unit code formatting.
- [ ] Update revision modal UI.
- [ ] Fetch document type options for modal select.
- [ ] Keep success/error states clear in modal.

## Success Criteria
- Student/member can submit revision files without Drive links.
- Stage and membership guards still hold.
- New revision appears in workspace after refresh.
- Failure path cleans up uploaded asset.

## Risk Assessment
- Frontend multipart handling may need custom `FormData` path instead of current JSON API helper.
- Multiple files per revision can complicate field naming and UX.
- Legacy `documents` content JSON inside lifecycle unit may need compatible shape for reads/debugging.

## Security Considerations
- Restrict revision upload to case owner/member only.
- Validate file type/size server-side even if UI pre-validates.
- Avoid exposing Cloudinary admin/public ids beyond what UI needs.

## Next steps
- Reuse same modal/data patterns for supporter flows in Phase 04 and 05.
