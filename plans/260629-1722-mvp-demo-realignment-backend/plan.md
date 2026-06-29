---
title: "Nexus MVP demo realignment backend"
description: "Backend-only plan to stabilize demo-path contracts, status transitions, messaging, reports, and attachment references."
status: pending
priority: P2
effort: 5h
branch: ui/heroui-to-mantine
tags: [mvp, demo, backend, api, prisma]
created: 2026-06-29
---

# Overview

Goal: làm backend demo path đủ rõ và đủ chặt để frontend có thể implement độc lập trên contract ổn định, không phải đoán workflow hay data semantics.

## Strategy
- Đi sâu vào route contracts, status transitions, role gates, event side effects, persistence fields.
- Chỉ rõ cái gì backend đang thật sự sở hữu: cases, admin triage, supporter assignment, messages, reports, packages, attachment references.
- Giữ frontend concerns ra ngoài package này.
- Ưu tiên chốt invariants, edge cases, validation matrix, error-handling cases, và regression checks trước khi mở rộng feature.

## Code-confirmed facts
- Case API đã có list/detail/create/status/assign/message/settings surfaces.
- Admin API đã có list/detail/accept/reject/request-more-info/assign surfaces.
- Supporter API đã có draft report, publish, request-more-info, close case surfaces.
- Report payload hiện đi qua `report.content_md` và frontend reviewer đang parse structured findings từ đó.
- Case schema hiện đã có `messages`, `events`, `reports`, `payments`, `lifecycle_units`, attachment/reference fields như `drive_folder_id`, `file_url`, `document_id`.
- Package list là backend-owned contract và có default seed behavior khi DB trống.

## Phases
- [ ] Phase 01 — [Lock backend boundaries and demo contracts](./phase-01-lock-backend-boundaries-and-demo-contracts.md)
- [ ] Phase 02 — [Stabilize case lifecycle, admin triage, and assignment](./phase-02-stabilize-case-lifecycle-admin-triage-and-assignment.md)
- [ ] Phase 03 — [Formalize messaging, review, and report payloads](./phase-03-formalize-messaging-review-and-report-payloads.md)
- [ ] Phase 04 — [Stabilize packages, attachments, and regression validation](./phase-04-stabilize-packages-attachments-and-regression-validation.md)

## Key dependencies
- Source parent plan: `../260629-1722-mvp-demo-realignment/plan.md`
- Shared research: `../260629-1722-mvp-demo-realignment/research/researcher-01-demo-path-report.md`
- Shared research: `../260629-1722-mvp-demo-realignment/research/researcher-02-ops-path-report.md`
- Shared synthesis: `../260629-1722-mvp-demo-realignment/reports/planner-synthesis-report.md`
- Docs: `../../docs/system-architecture.md`, `../../docs/codebase-summary.md`

## Scope in
- Cases/admin/supporter/report/package API contracts.
- Status, internal status, role gates, transition rules.
- Event side effects and persistence semantics.
- Message persistence and report payload contract.
- Package seeding/list behavior.
- Attachment/reference persistence behavior.
- Edge cases, validation matrix, error-handling cases.
- Demo-critical regression verification.

## Scope out
- Copy-only UI changes.
- Layout/component presentation.
- Demo script.
- Realtime websocket subsystem.
- Large workflow redesign beyond demo-critical transitions.

## Success signal
- Backend plan đủ cụ thể để API implementer không phải đoán route semantics.
- Frontend có thể build trên contract rõ ràng mà không cần sửa schema lớn.
- Demo path không bị mơ hồ ở status, assignment, messages, reports, attachments.