---
title: "Nexus MVP demo realignment frontend"
description: "Frontend-only plan to realign intake, workspace, and triage surfaces for a clearer MVP demo story."
status: completed
priority: P2
effort: 4h
branch: ui/heroui-to-mantine
tags: [mvp, demo, frontend, ux, apps-web-1]
created: 2026-06-29
---

# Overview

Goal: làm frontend demo path kể một câu chuyện rõ và nhất quán, nhưng không over-spec UI để implementer vẫn còn không gian judgment và sáng tạo.

## Strategy
- Chỉ xử lý presentation-layer.
- Giữ shared sidebar workspace, chat, timeline, intake shell hiện có.
- Chốt narrative bằng `Hồ sơ phản biện` trên customer-facing path.
- Tập trung vào wording, emphasis order, status display mapping, screen continuity.
- Tránh mô tả quá chi tiết visual treatment, spacing, iconography, micro-layout.

## Code-confirmed facts
- Student và supporter đã dùng shared workspace shell/sidebar pattern.
- `TabDiscussionChat` đã có GET/POST messages và polling 5 giây.
- `useCaseDetails` đã polling 10 giây và trả case + intake snapshot + report + document/timeline data cần cho story.
- `ActivityTimeline` đã có thật và đọc từ `caseData.events`.
- Intake documents hiện đang là 1 bundle `documents[0]` với Drive/Docs URL chính + checklist loại tài liệu.

## Phases
- [x] Phase 01 — [Lock demo narrative and terminology](./phase-01-lock-demo-narrative-and-terminology.md)
- [x] Phase 02 — [Realign intake and submit flow](./phase-02-realign-intake-and-submit-flow.md)
- [x] Phase 03 — [Unify case status and ops surfaces](./phase-03-unify-case-status-and-ops-surfaces.md)
- [x] Phase 04 — [Verify end-to-end demo path](./phase-04-verify-end-to-end-demo-path.md)

## Key dependencies
- Source parent plan: `../260629-1722-mvp-demo-realignment/plan.md`
- Research: `../260629-1722-mvp-demo-realignment/research/researcher-01-demo-path-report.md`
- Research: `../260629-1722-mvp-demo-realignment/research/researcher-02-ops-path-report.md`
- Synthesis: `../260629-1722-mvp-demo-realignment/reports/planner-synthesis-report.md`
- Docs: `../../docs/project-overview-pdr.md`, `../../docs/system-architecture.md`, `../../docs/codebase-summary.md`

## Scope in
- Copy, labels, headings, helper text, empty states.
- Information hierarchy và section order.
- Shared status display mapping ở frontend.
- Student/admin/supporter wording coherence.
- Discussion/chat và timeline prominence trong demo path.
- Demo walkthrough script và pass/fail verification.

## Scope out
- Backend schema/contracts.
- Workflow/state-machine redesign.
- Upload/storage redesign.
- Realtime subsystem.
- AI parsing pipeline.
- Auth/permission redesign.
- Pixel-perfect art direction.

## Success signal
- Người xem hiểu trong 30 giây `Hồ sơ phản biện` là gì.
- Student -> admin -> supporter đọc như 1 workflow thống nhất.
- Chat/timeline được nhìn như coordination surface cốt lõi.
- Frontend plan đủ rõ để implement nhưng không bóp chết UI judgment.