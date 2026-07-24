# Researcher 02 — Workspace UI and IA

## Scope
- inspect current student/supporter workspace shell
- identify document-related UI seams
- mark preserve vs replace boundaries

## Verified findings
1. Shared workspace shell already exists and should be preserved.
   - student workspace page: `apps/web-1/app/dashboard/case/[id]/page.tsx:22-175`
   - supporter workspace page: `apps/web-1/app/supporter/case/[id]/page.tsx:20-128`
   - both use same shell pattern: sidebar + main pane + tab switching.

2. Current sidebar mixes navigation with version switching.
   - `WorkspaceSidebar` tabs: `idea`, `report`, `discussion`, `timeline`, `settings`
   - secondary panel changes between version selector and tab description.
   - `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx:27-149`

3. Document UI is still legacy content/report split.
   - `TabIdeaContent` parses lifecycle unit JSON and renders extracted text + Drive link: `apps/web-1/app/dashboard/case/[id]/_components/TabIdeaContent.tsx:13-124`
   - `TabReportFindings` parses `report.content_md` JSON and renders findings accordion: `apps/web-1/app/dashboard/case/[id]/_components/TabReportFindings.tsx:50-193`

4. `WorkspaceTabs` is likely dead legacy alternate chrome.
   - separate horizontal tab bar with same tab contract, no current evidence of use beyond file itself: `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceTabs.tsx:6-76`

5. `useCaseDetails` is main replacement seam for new document workspace data.
   - both pages depend on same hook shape: `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts:4-68`
   - data contract currently optimized for old tabs: `intake_snapshot`, `latest_report`, `document_board_sections`, `round_history`.

6. Preserve chat/timeline/settings surfaces as independent domains.
   - `TabDiscussionChat` and `ActivityTimeline` stay valid under new IA.
   - student-only settings remains valid separate domain.

## Planning implications
- keep double-navbar shell
- replace `idea/report` top-level split with one `documents` domain
- keep primary nav stable: documents, discussion, timeline, settings
- make secondary nav checkpoint-based, not report-vs-idea based
- move version/assessment browsing into document surface, not generic sidebar behavior

## Suggested IA boundary
- preserve page shell, auth guards, loading/error handling
- preserve sidebar component role, but rewrite its info architecture
- replace `TabIdeaContent`
- demote or replace `TabReportFindings` as document artifact viewer, not top-level workspace tab
- leave chat/timeline/settings largely untouched in first UI phase

## Risks
- if sidebar state contract changes too aggressively, student/supporter pages both break
- report review page may rely on old `latest_report` assumptions
- mixed Mantine CSS module + Tailwind utility patterns can make shell refactor noisy

## Unresolved questions
- should document detail open inline in same pane, or use nested document subview state?
- should `report` survive as artifact label inside document manager, or be renamed to assessment output?
