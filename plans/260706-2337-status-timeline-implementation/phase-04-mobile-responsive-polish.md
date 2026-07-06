# Phase 4: Mobile Responsive & Polish

## Context Links
- Parent Plan: [plan.md](./plan.md)
- Preview HTML: [260706-2327-timeline-preview.html](../reports/260706-2327-timeline-preview.html)

## Overview
- Priority: P2
- Current status: Completed
- Brief description: Optimize the Stepper for mobile view using a breadcrumb approach, and polish the styling (animations, colors).

## Key Insights
- Full horizontal steppers break on mobile screens.
- We need to conditionally render a breadcrumb/popup on mobile, or use Mantine's Stepper vertical orientation / hide labels.

## Requirements
- Use Tailwind responsive classes (`hidden lg:block`, `block lg:hidden`) to toggle between the full stepper and the condensed breadcrumb view on mobile.
- Polish colors, ensuring they match Nexus Dark Mode requirements.

## Architecture
- `CasePipelineStepper` should contain both the full desktop `Stepper` and the mobile UI, toggled via CSS media queries.

## Related Code Files
- Modify: `apps/web-1/components/case/CasePipelineStepper.tsx`

## Implementation Steps
1. Add mobile layout code to `CasePipelineStepper.tsx` (the "Bước X/6 - Chi tiết ▸" UI).
2. Wrap the desktop `<Stepper>` in `hidden md:block`.
3. Wrap the mobile UI in `block md:hidden`.
4. Implement Mantine `<Drawer>` (trượt từ dưới lên) cho nút "Chi tiết" để show danh sách timeline dọc.
5. Add pulse animations for the active dot using Tailwind (`animate-pulse`).

## Todo List
- [x] Implement Mobile Breadcrumb view
- [x] Implement Mobile Details Drawer/Modal
- [x] Add CSS Polish

## Success Criteria
- On screens < 768px, the stepper turns into a compact breadcrumb.
- Clicking the breadcrumb opens a list showing all steps vertically.

## Risk Assessment
- Mantine `Drawer` might have z-index issues if not configured properly.
- Mitigation: Verify z-index context in the Workspace layout.

## Security Considerations
- N/A

## Next Steps
- Implementation complete. Proceed to PR creation and review.
