# Phase 04 — Add supporter output and evidence flows

## Context links
- Parent plan: `./plan.md`
- Supporter review page: `apps/web-1/app/supporter/case/[id]/review/page.tsx:30`
- Case details hook: `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts:5`
- Document workspace contract: `apps/api/src/modules/documents/domain/document-contract.ts:33`

## Overview
- Date: 2026-07-01
- Description: Add new backend write paths for supporter output files and user-uploaded external evaluation feedback artifacts.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Supporter already has dedicated workspace and review surface.
- Document workspace already separates version units and assessment units.
- <!-- Updated: Validation Session 1 - external-feedback semantics --> `Đánh giá` tab should represent external evaluation feedback from outside Nexus, not internal assessments created by supporter/admin.
- External evaluation artifacts usually serve 2 moments: pre-support diagnostic context and post-support outcome evidence.

## Requirements
- Supporter can upload output artifacts tied to case/checkpoint/lifecycle unit semantics.
- User/case member can upload external evaluation feedback artifacts into document workspace `Đánh giá bên ngoài` semantics.
- External evaluation artifacts must support both pre-support diagnostic context and post-support outcome evidence.
- External evaluation artifacts must capture locked MVP metadata sufficient for UI grouping/filtering:
  - `source`: `lecturer` | `mentor` | `other`
  - `source_other_text`: optional, required only when `source = other`
  - `timing`: `pre_support` | `post_support`
  - `selected_version_no`: required linked version
- Role/stage guards must be explicit and testable.
- New documents must appear in `document_workspace` without forcing a storage-model rewrite.

## Architecture
- Add dedicated use cases instead of overloading revision endpoint.
- Output flow likely writes into version-linked or report-linked unit, depending final contract.
- <!-- Updated: Validation Session 1 - external-feedback container --> External evaluation feedback flow writes into assessment unit as a technical grouping container; if missing, server auto-creates next `aNN-vNN` for selected version.
- Copy and API contracts must describe these artifacts as external feedback/evaluation context, not Nexus-owned assessment rounds.
- Keep storage grouped by technical lifecycle units if that is cheaper, but expose enough metadata for frontend to render `Đánh giá bên ngoài` as one business table instead of forcing users to understand `assessment_units`.
- Store external-feedback metadata at document level for MVP, not only at assessment-unit level.
- Both flows reuse shared upload pipeline and DB-backed document type validation.

## Related code files
- Modify/create: `apps/api/src/modules/documents/application/**`
- Modify/create: `apps/api/src/modules/cases/application/**`
- Modify/create: `apps/api/src/modules/cases/http/**`
- Modify/create: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- Modify/create: `apps/web-1/app/supporter/case/[id]/**`
- Modify/create: `apps/web-1/app/admin/**`

## Implementation Steps
1. Lock exact business contract for supporter output endpoint.
2. Lock external evaluation feedback creation/selection rule for the `Đánh giá bên ngoài` tab.
3. Lock external-feedback metadata contract exactly as:
   - `source`: `lecturer` | `mentor` | `other`
   - `source_other_text?`: required only when `source = other`
   - `timing`: `pre_support` | `post_support`
   - `selected_version_no`: required integer
4. Implement supporter output use case with role/stage guards.
5. Implement external evaluation feedback use case with user/case-member guards.
6. Extend repository helpers to create needed lifecycle units and document rows.
7. Store external-feedback metadata on document rows / metadata payload.
8. Ensure event log entries are created for output/external-feedback submissions.
9. Verify `GET /cases/:id` response includes new files in correct unit bucket.
10. Expose UI-friendly grouping/filter metadata for pre-support diagnostic artifacts versus post-support outcome evidence.

## Todo list
- [ ] Define supporter output endpoint and payload.
- [ ] Define external evaluation feedback endpoint and payload.
- [ ] Define unit targeting/creation rules.
- [ ] Validate `source_other_text` conditional rule.
- [ ] Validate `selected_version_no` existence rule.
- [ ] Add user/case-member guard coverage for `Đánh giá` uploads.
- [ ] Add repository support for output/external-feedback document rows.
- [ ] Store external-feedback metadata on document rows.
- [ ] Add timeline/event entries.
- [ ] Verify read-model mapping for new doc types.

## Success Criteria
- Supporter can upload output files.
- User/case member can upload external evaluation feedback files in the `Đánh giá` flow.
- Files land in correct checkpoint/unit section in workspace.
- `Đánh giá` semantics no longer imply Nexus-owned assessment.
- Guard failures return clear errors.

## Risk Assessment
- External feedback grouping can still be misread as Nexus internal assessment if labels stay generic.
- Output uploads may overlap conceptually with approved report artifact generation.
- Pre-support and post-support evaluation artifacts may blur together if no grouping cue is added.

## Security Considerations
- User/case-member authorization for external-feedback uploads must be enforced server-side.
- External evaluation feedback uploads should not let unrelated users attach classroom/private artifacts to another case.
- Event metadata should avoid storing sensitive raw file internals unnecessarily.

## Next steps
- Surface new actions inside document workspace `Đánh giá` tab during Phase 05.
