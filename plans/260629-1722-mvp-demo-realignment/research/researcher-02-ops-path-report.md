# Researcher 02 — Ops path report

## Scope
Admin/supporter coherence for MVP demo in `apps/web-1`.

## Sources checked
- `docs/codebase-summary.md`
- `docs/code-standards.md`
- `docs/archive/system-architecture.md`
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabIdeaContent.tsx`
- `apps/web-1/app/dashboard/intake/_types/intake.types.ts`

## Findings
1. Admin already has enough data to triage, but section framing is not optimized for fast judgment.
   - `AdminCaseDetailModal.tsx` shows contact, summary, support need, expected outputs, lecturer feedback, documents.
   - Main issue is clarity/order, not missing information.

2. Supporter flow assumes intake snapshot is reliable input.
   - `supporter/case/[id]/page.tsx` and `review/page.tsx` depend on case context being understandable immediately.
   - Demo risk: if intake wording is fuzzy, supporter screen looks complicated rather than helpful.

3. Student case detail still exposes structured idea/pain point/customer framing.
   - `TabIdeaContent.tsx` parses `idea`, `pain_point`, `customer`, `drive_url` from intake lifecycle content.
   - This can conflict with the document-first direction if demo claims docs are primary evidence.

4. Status language likely differs across student/admin/supporter surfaces.
   - Admin modal uses internal triage labels.
   - Student surfaces need simpler “đã nhận / đang xem xét / cần bổ sung / đã có phản hồi” language.

5. Low-risk demo win is UI coherence, not workflow rewrite.
   - Existing architecture already supports the story if labels, grouping, and narrative become consistent.

## Recommended focus
1. Reorder admin detail sections so summary, need, and documents support triage instantly.
2. Align student-facing and admin/supporter-facing wording around one case narrative.
3. Keep supporter review mechanics intact; only improve upstream clarity.
4. Avoid touching backend status model unless one shared display mapping is easy.
5. Treat `TabIdeaContent` as likely follow-up area if demo path includes student case detail heavily.

## Unresolved questions
- If demo includes student case detail tabs, decide whether `TabIdeaContent.tsx` also needs copy/structure adjustment in this iteration.
