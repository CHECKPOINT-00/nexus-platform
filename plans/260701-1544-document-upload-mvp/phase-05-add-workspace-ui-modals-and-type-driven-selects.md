# Phase 05 — Add workspace UI modals and type-driven selects

## Context links
- Parent plan: `./plan.md`
- Frontend scout: `./research/researcher-02-frontend-scout-report.md`
- Revision modal: `apps/web-1/app/dashboard/case/[id]/_components/RevisionSubmitModal.tsx:15`
- Intake step to preserve: `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx:37`
- Document workspace reader: `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx:18`

## Overview
- Date: 2026-07-01
- Description: Ship modal-based post-intake upload UX without changing intake URL flow or workspace shell.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Revision modal already provides UX pattern to evolve rather than replace.
- Intake document step is intentionally different and should stay URL-only.
- <!-- Updated: Validation Session 1 - đánh giá tab semantics --> Current `Đánh giá` wording is too generic and can read like Nexus is performing assessments, even though the tab should represent external evaluation feedback uploaded by users.
- <!-- Updated: Validation Session 1 - IA simplification --> Current UX repeats version semantics in sidebar, inner tab, and table column; MVP should collapse that into table metadata/filter/sort rather than primary navigation.
- Case details query already refreshes workspace data after mutation invalidation.

## Requirements
- Revision modal supports file upload, typed select, clear error/loading states.
- Supporter output modal exists in supporter workspace.
- Document workspace inner IA becomes exactly 3 tabs: `Tổng quan`, `Tài liệu`, `Đánh giá bên ngoài`.
- External evaluation feedback upload action exists inside document workspace `Đánh giá bên ngoài` tab for user/case member flow.
- External feedback modal must collect locked MVP metadata:
  - `source`: `lecturer` | `mentor` | `other`
  - `source_other_text`: show only when `source = other`
  - `timing`: `pre_support` | `post_support`
  - `selected_version_no`: required, default latest version
- `Tài liệu` tab contains all Nexus support-flow documents: intake context references, audit/supporter outputs, revision uploads, and related support artifacts that are not external evaluation feedback.
- `Đánh giá bên ngoài` tab copy must explain these files are outside feedback/evaluation context used by Nexus to understand problem state and outcomes.
- UI should distinguish pre-support diagnostic artifacts from post-support outcome evidence, at minimum by labels/filters.
- Version is shown as row metadata/filter/sort, not as sidebar-first or tab-first navigation.
- Type options come from API, not hardcoded free-text inputs.
- Workspace refreshes after successful upload.

## Architecture
- Introduce small shared form primitives/hooks only if 3 modals would otherwise duplicate upload field logic.
- Use `FormData` mutations for post-intake writes.
- Keep intake `DocumentInputStep` unchanged except maybe shared constants if harmless.
- Prefer action buttons inside each tab header / toolbar; avoid more nested navigation.
- Remove version submenu from `WorkspaceSidebar`; outer workspace shell remains, inner document IA lives inside `DocumentWorkspace` tabs.
- Keep `version_units` and `assessment_units` as technical containers if backend reuse is cheaper, but map them into 2 UI-facing row collections for `Tài liệu` and `Đánh giá bên ngoài`.
- External-feedback modal uses 4 business fields only: file, document type, source/timing, selected version; `source_other_text` appears conditionally when needed.
- <!-- Updated: Validation Session 1 - UX semantics --> Keep `assessment_units` as technical grouping, but present `Đánh giá` UX as external feedback/evaluation context rather than an internal Nexus assessment workflow.

## Related code files
- Modify: `apps/web-1/app/dashboard/case/[id]/_components/RevisionSubmitModal.tsx`
- Modify/create: `apps/web-1/app/dashboard/case/[id]/hooks/*`
- Modify/create: `apps/web-1/app/supporter/case/[id]/**`
- Modify/create: `apps/web-1/app/admin/**`
- Modify/create: `apps/web-1/types/case.ts` or adjacent API response types
- Preserve: `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`

## Implementation Steps
1. Remove version submenu behavior from `WorkspaceSidebar` and simplify document helper copy.
2. Refactor `DocumentWorkspace` tabs from `Tổng quan / Phiên bản / Đánh giá` to `Tổng quan / Tài liệu / Đánh giá bên ngoài`.
3. Add query hook for document type options.
4. Add shared `FormData` upload helper for case document mutations.
5. Convert revision modal from URL fields to file input/select-based form.
6. Add supporter output modal and action trigger inside `Tài liệu` tab.
7. Add external evaluation feedback upload modal and action trigger inside `DocumentWorkspace` `Đánh giá bên ngoài` tab.
8. In external-feedback modal, render fields in order: file, document type, source, conditional `source_other_text`, timing, selected version.
9. Default `selected_version_no` to latest version while still allowing user override.
10. Add table controls for search/filter/sort, including version as metadata rather than navigation state.
11. Add microcopy/section labels so `Đánh giá bên ngoài` reads as outside feedback context, not Nexus-owned assessment.
12. Show upload progress/pending/error clearly.
13. Invalidate/refetch case details after success and close modal cleanly.

## Todo list
- [ ] Remove version submenu from workspace sidebar.
- [ ] Replace inner tabs with `Tổng quan` / `Tài liệu` / `Đánh giá bên ngoài`.
- [ ] Add document type options hook.
- [ ] Add `FormData` mutation helpers.
- [ ] Update revision modal.
- [ ] Add supporter output modal.
- [ ] Add external evaluation feedback modal in `Đánh giá bên ngoài` tab.
- [ ] Add source select: `lecturer` / `mentor` / `other`.
- [ ] Show `source_other_text` only when `source = other`.
- [ ] Add timing select: `pre_support` / `post_support`.
- [ ] Default selected version to latest version.
- [ ] Add table search/filter/sort controls.
- [ ] Keep version as row metadata/filter/sort only.
- [ ] Add helper copy for external feedback semantics.
- [ ] Add grouping/labels for `trước hỗ trợ` vs `sau hỗ trợ` artifacts.
- [ ] Add success/error notifications.
- [ ] Verify workspace refresh path.
- [ ] Keep intake UI unchanged.

## Success Criteria
- User can complete all post-intake upload actions from modal UX.
- Inner document IA is reduced to `Tổng quan` / `Tài liệu` / `Đánh giá bên ngoài` with no duplicate version-first navigation.
- `Đánh giá bên ngoài` tab clearly reads as external evaluation feedback context.
- Pre-support and post-support artifacts are visually distinguishable enough for MVP.
- Version is easy to understand through row metadata/filter/sort without appearing as primary IA in 3 different places.
- No free-text document type entry remains in post-intake forms.
- Workspace updates reflect new files after submit.
- Intake step still uses Drive URL + checklist flow.

## Risk Assessment
- Shared modal abstraction can become premature; keep thin until duplication proves real.
- If wording stays too generic, users may still think Nexus is doing classroom assessment.
- Browser upload UX may need per-file restrictions to prevent confusing server rejections.

## Security Considerations
- UI hints do not replace server guard logic.
- Do not leak role-only actions to unauthorized users.
- Avoid exposing internal type filtering logic in ways that let clients bypass server checks.

## Next steps
- Feed final UI into verification/doc updates in Phase 06.
