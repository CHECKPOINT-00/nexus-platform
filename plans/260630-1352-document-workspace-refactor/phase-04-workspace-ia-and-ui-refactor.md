# Phase 04 — Workspace IA and UI refactor

## Context links
- [Parent plan](./plan.md)
- [UI IA research](./research/researcher-02-ui-ia-report.md)
- [Phase 03](./phase-03-api-assembly-and-compatibility.md)
- [Project overview PDR](../../docs/project-overview-pdr.md)
- [System architecture](../../docs/system-architecture.md)

## Overview
- Date: 2026-06-30
- Priority: P2
- Implementation status: pending
- Review status: pending
- Goal: preserve shared workspace shell while replacing legacy `idea/report` narrative with document-first IA and file inventory views.

## Key Insights
- shared sidebar shell is strong and should stay
- current `TabIdeaContent` and `TabReportFindings` are legacy data renderers
- sidebar currently mixes nav with version control behavior
- chat/timeline/settings can stay mostly untouched in first UI pass

## Requirements
### Functional
- primary nav must expose `Tài liệu`, `Thảo luận`, `Lịch sử`, `Cấu hình`
- document domain must browse by checkpoint, then `Tổng quan`, `Versions`, `Assessments`
- unit detail views must show file/url metadata and open/download actions
- student and supporter pages must stay structurally aligned
- workspace state must support refresh/deep-link restore for checkpoint, section, version, and assessment
- UI must define broken-link, missing-file, and expired-link behavior for open/download actions
- dynamic lists must recover safely when polling or mutation changes available versions/assessments

### Non-functional
- preserve current auth/loading/error shell behavior
- keep Mantine double-navbar approach
- minimize disruption to chat/timeline/settings
- define accessibility and keyboard-navigation behavior for dynamic two-level nav
- handle large file lists, long filenames, and duplicate labels without losing clarity
- verify desktop/mobile shell parity after nav redesign

## Architecture
### IA target
- primary nav stable by domain
- secondary nav stable by checkpoint and section
- dynamic version/assessment lists live in main pane, not generic sidebar state

### Component direction
- preserve workspace page shells
- rewrite sidebar IA model
- replace `TabIdeaContent` with document overview/list/detail surfaces
- demote or replace `TabReportFindings` as artifact viewer only

## Related code files
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabIdeaContent.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabReportFindings.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceTabs.tsx`

## Implementation Steps
1. redefine tab/domain state for document-first IA
2. define URL/search-param restore rules for checkpoint, section, version, and assessment state
3. redesign sidebar labels and secondary nav behavior
4. build document checkpoint overview view
5. build versions list and version detail views
6. build assessments list and assessment detail views
7. design empty states for legacy-only, mixed, and broken-link document views
8. preserve discussion, timeline, settings paths
9. align student/supporter page usage with shared shell state
10. verify accessibility, keyboard navigation, and responsive shell behavior

## Todo List
- [ ] confirm final IA labels
- [ ] define document view state model
- [ ] define deep-link/refresh restore behavior
- [ ] identify reusable shell CSS/module parts
- [ ] replace old parsed content views
- [ ] define broken-link and missing-file UX
- [ ] define large-list/long-filename/duplicate-label rendering rules
- [ ] smoke-test student/supporter parity
- [ ] smoke-test keyboard navigation and mobile shell behavior

## Success Criteria
- user can browse files by checkpoint and lifecycle unit
- workspace no longer depends on parsed content summary for document tab
- student and supporter still share one coherent shell pattern

## Risk Assessment
- state drift between student and supporter page variants
- CSS/layout regressions in sidebar shell
- confusion if old and new document concepts overlap during rollout

## Security Considerations
- document actions respect role visibility
- no hidden or internal-only artifacts appear in user-facing lists
- file open/download URLs only shown for authorized case users

## Next Steps
- implement against additive API contract
- verify shell behavior on desktop/mobile
- prepare cleanup of dead legacy tab components
