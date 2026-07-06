---
title: "Activity Timeline Mantine Refactor"
description: "Refactor ActivityTimeline component to use `@mantine/core` Timeline while preserving status styling and animations."
status: completed
priority: P2
effort: 2h
branch: current
tags: [frontend, mantine, timeline, refactor]
created: 2026-07-07
---

# Activity Timeline Mantine Refactor Plan

## Overview

This plan refactors the custom Tailwind CSS-based timeline implementation inside `ActivityTimeline` into a standard `@mantine/core` v9 `Timeline` component. This ensures the timeline conforms to the project's design system standards while maintaining its current beautiful, status-specific coloring, micro-interactions, and detailed data rendering.

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Refactor ActivityTimeline | Completed | 2h | [phase-01](./phase-01-refactor-timeline.md) |

## Dependencies

- Mantine `@mantine/core` v9 (`Timeline` component).
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`
