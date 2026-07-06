# Phase 2: Refactor Dashboard CaseCard

## Context Links
- Parent Plan: [plan.md](./plan.md)

## Overview
- Priority: P2
- Current status: Completed
- Brief description: Update the Dashboard CaseCard to use the new single badge style with fraction progress instead of multiple confusing badges.

## Key Insights
- Clean dashboard = lower cognitive load for students.
- Need to ensure we don't break the layout if titles are long.

## Requirements
- Replace the dual badge (`user_facing_stage` and `payment_status`) with a single computed pipeline badge strictly for Case Status.
- Append a fraction progress text like `2/5 ▸` to the badge text.
- If `payment_status` is a warning state (e.g. pending), render a small Warning Icon (⚠️) or standalone Banner attached to the Card.

## Architecture
- Presentation-only change in `CaseCard.tsx`.
- Use the new Semantic Color map for the primary status badge.

## Related Code Files
- Modify: `apps/web-1/app/dashboard/_components/CaseCard.tsx`

## Implementation Steps
1. Import `getPipelineStep` and `studentStatusMap` in `CaseCard.tsx`.
2. Locate the badge rendering logic (around L50-L57).
3. Compute the active step index based on the pipeline stage.
4. Render the primary `<Badge>` containing the computed label, color, and `X/5 ▸`.
5. Conditionally render a Payment Alert Icon/Banner if `case.payment_status` requires action.

## Todo List
- [x] Update imports in `CaseCard.tsx`
- [x] Implement single badge rendering
- [x] Test layout rendering

## Success Criteria
- CaseCard visually matches the "After" mockup from the brainstorm.
- Only one status badge is shown per card.

## Risk Assessment
- None significant. Simple UI change.

## Security Considerations
- N/A

## Next Steps
- Move to [phase-03](./phase-03-implement-workspace-header.md)
