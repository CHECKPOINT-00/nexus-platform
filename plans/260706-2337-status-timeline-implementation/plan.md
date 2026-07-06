---
title: "Status & Timeline Redesign Implementation"
description: "Implement Mantine Stepper pipeline, decoupled Status/Payment UI, and Semantic Colors."
status: completed
priority: P1
effort: 6h
branch: current
tags: [frontend, ux, mantine, status]
created: 2026-07-06
---

# Status & Timeline Redesign Implementation Plan

## Overview

Refactoring the presentation layer of the Case status system based on `260706-2327-brainstorm-status-timeline.md` and `260707-0015-brainstorm-status-separation.md`. This plan implements a decoupled status system where the Mantine `Stepper` handles strictly professional progress (`user_facing_stage`), while `payment_status` is elevated to an independent warning banner/icon. It also introduces Role-based mapping and a strict A11y Semantic Color system (Amber for User Action, Blue for System Action).

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Component & Type Setup | Completed | 2h | [phase-01](./phase-01-component-and-type-setup.md) |
| 2 | Refactor Dashboard CaseCard | Completed | 1h | [phase-02](./phase-02-refactor-dashboard-casecard.md) |
| 3 | Implement Workspace Header | Completed | 2h | [phase-03](./phase-03-implement-workspace-header.md) |
| 4 | Mobile Responsive & Polish | Completed | 1h | [phase-04](./phase-04-mobile-responsive-polish.md) |

## Dependencies

- Mantine `@mantine/core` v9 (`Stepper` component).
- `apps/web-1/types/case.ts` type definitions.
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`
