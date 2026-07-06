# Phase 1: Refactor ActivityTimeline

## Context Links
- Parent Plan: [plan.md](./plan.md)

## Overview
- Priority: P2
- Current status: Completed
- Brief description: Replace the custom HTML/Tailwind timeline layout in `ActivityTimeline.tsx` with a standard `@mantine/core` v9 `Timeline` component.

## Key Insights
- Keep `getEventDetails` and `formatDateTime` logic completely unchanged to maintain existing event metadata configurations.
- Use `classNames` on `<Timeline.Item>` to clear Mantine's default bullet border/background (`bg-transparent border-0 p-0`), then render our existing custom styled div inside the `bullet` prop to keep status-specific coloring and micro-animations.
- Use `classNames={{ itemLine: "border-l border-border-app" }}` to style the timeline line according to the system theme.

## Architecture
- Refactored component inside `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`.

## Implementation Steps
1. Import `Timeline` and `Text` from `@mantine/core`.
2. Wrap the event list map in `<Timeline bulletSize={32} lineWidth={2} active={sortedEvents.length}>`.
3. Wrap each event element inside `<Timeline.Item>`.
4. Pass the custom-styled icon container into the `bullet` prop.
5. Move title and timestamp into the `title` prop.
6. Pass event description and actor details as children of the `<Timeline.Item>`.
7. Configure `classNames` on `<Timeline.Item>` to style the bullet and line.
8. Perform type checking and lint validation to verify the build passes.

## Todo List
- [x] Implement `@mantine/core` Timeline in `ActivityTimeline.tsx`
- [x] Run type checking to verify compile succeeds
- [x] Ensure layout is responsive and matches aesthetics

## Success Criteria
- The build succeeds without type errors.
- The UI matches the existing layout closely while using the semantic Mantine component.
