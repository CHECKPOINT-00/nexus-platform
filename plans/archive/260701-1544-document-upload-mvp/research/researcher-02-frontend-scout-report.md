# Frontend scout report — document upload MVP

## Sources
- `plans/reports/brainstorm-260701-1517-document-upload-mvp-summary.md`
- `plans/reports/checklist-260701-1517-document-upload-mvp.md`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts:5`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseRevision.ts:4`
- `apps/web-1/app/dashboard/case/[id]/_components/RevisionSubmitModal.tsx:15`
- `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx:18`
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx:37`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx:30`

## Current state
- Case detail query already exposes `documentWorkspace` from `useCaseDetails.ts:59`.
- Student revision submit uses modal UX already, but fields are Drive link + free-text document type.
- Intake document step already has distinct URL-only UX and checklist semantics; should stay separate.
- Document workspace render path already reads normalized units/files; no need to redesign read surface first.
- Supporter review page exists as separate flow; likely source for supporter action placement and permission context.

## Reuse candidates
- Keep modal-based action pattern from `RevisionSubmitModal.tsx:76`.
- Reuse react-query invalidation in `useCaseRevision.ts:24` and `useCaseDetails.ts:23`.
- Reuse document workspace render after submit success instead of custom state patching.
- Reuse Mantine modal/form/error patterns already present in revision modal and supporter review notifications.

## Likely touch points
- Replace revision modal URL fields with file input + doc type select + upload error state.
- Add supporter output upload modal in supporter case workspace surface.
- Add supporter/admin evidence upload modal in supporter/admin surfaces with checkpoint/version targeting.
- Add API hook for fetching document type options.
- Add shared upload form helpers/components if 3 modals repeat same fields.

## Constraints
- Keep intake `DocumentInputStep` URL/checklist flow unchanged.
- Keep shared workspace shell and avoid new page flows for MVP.
- Existing workspace tabs emphasize report/discussion/timeline; document actions should fit current workspace, not fork navigation.
- Types currently treat `document_type` as string labels in UI; switch to API options without breaking current render labels.

## UX risks
- Upload forms can become noisy if checkpoint/version/unit selection shown too early.
- Evidence flow may confuse users if assessment round creation is automatic but UI still asks for round/unit.
- Supporter/admin action placement may split across multiple pages unless one source of truth chosen.
- Large file uploads need obvious progress and failure messaging or modal feels broken.

## Open questions
- Best placement for supporter output action: supporter workspace page vs review page?
- Should admin get evidence upload inside case detail modal or dedicated case workspace?
- Need single shared modal component vs 3 thin role-specific modals?
