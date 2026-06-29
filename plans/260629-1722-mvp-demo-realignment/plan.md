---
title: "Nexus MVP demo realignment"
description: "Superseded parent plan. Active implementation plans now live in separate frontend and backend packages."
status: superseded
priority: P2
effort: archived
branch: ui/heroui-to-mantine
tags: [mvp, demo, archived]
created: 2026-06-29
---

# Overview

Plan này đã được tách thành 2 package độc lập để implement song song nhưng vẫn rõ boundary:

- Frontend: `../260629-1722-mvp-demo-realignment-frontend/plan.md`
- Backend: `../260629-1722-mvp-demo-realignment-backend/plan.md`

## Why superseded
- Frontend cần brief vừa đủ để không bóp chết UI judgment và sáng tạo.
- Backend cần detail sâu hơn về contracts, workflow, persistence, validation.
- 1 package cũ không còn tối ưu cho việc giao implementation độc lập.

## Status
- Package này giữ vai trò nguồn gốc lịch sử và shared references.
- Không nên dùng package này làm active implementation plan nữa.

## Shared references kept here
- Research: `./research/researcher-01-demo-path-report.md`
- Research: `./research/researcher-02-ops-path-report.md`
- Synthesis: `./reports/planner-synthesis-report.md`
- Historical phase files: `./phase-01-lock-demo-narrative-and-terminology.md`, `./phase-02-realign-intake-and-submit-flow.md`, `./phase-03-unify-case-status-and-ops-surfaces.md`, `./phase-04-verify-end-to-end-demo-path.md`

## Active packages

### Frontend package
- Goal: narrative, wording, status display, workspace coherence, demo verification.
- Entry: `../260629-1722-mvp-demo-realignment-frontend/plan.md`

### Backend package
- Goal: API contracts, status transitions, assignment, messages, reports, packages, attachment references.
- Entry: `../260629-1722-mvp-demo-realignment-backend/plan.md`

## Migration note
- Khi implement, mở đúng package theo domain cần làm.
- Chỉ quay lại package này nếu cần research/synthesis gốc hoặc historical context.