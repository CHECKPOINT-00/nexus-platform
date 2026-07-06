# Phase 3: Implement Workspace Header

## Context Links
- Parent Plan: [plan.md](./plan.md)

## Overview
- Priority: P1
- Current status: Completed
- Brief description: Inject the `CasePipelineStepper` into the Workspace Header to give users a forward-looking roadmap of their case.

## Key Insights
- The header needs to accommodate the SLA timer alongside the Stepper.
- `Stepper` might require overriding default Mantine styles for the dark mode aesthetic required by the system.

## Requirements
- `CaseStatusHeader.tsx` must render `CasePipelineStepper` strictly tracking professional progress.
- Keep existing components like the SLA timer intact.
- Must render a full-width Payment Warning Banner above/below the stepper if `payment_status` is actionable.

## Architecture
- Container pattern: `CaseStatusHeader` manages data/props, passes them down to `CasePipelineStepper` (stateless UI component).
- `PaymentBanner` component (or simple Alert) injected if payment is due.

## Related Code Files
- Modify: `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`

## Implementation Steps
1. Import `CasePipelineStepper` in `CaseStatusHeader.tsx`.
2. Replace the old single badge displaying `getStageLabel` with the new Stepper component.
3. Pass `case.user_facing_stage` into the stepper.
4. Add conditional logic to render a Payment Warning Alert (Amber background, dark text) if `case.payment_status` demands user attention.
5. Align layout using Tailwind so the timer sits neatly next to or below the stepper depending on space.

## Todo List
- [x] Integrate Stepper into Header
- [x] Fix flex/grid alignments
- [x] Test with different case states

## Success Criteria
- Stepper correctly shows progress and the active step matches the case.
- SLA Timer remains visible and functional.

## Risk Assessment
- Desktop view might get cramped if the case title is very long.
- Mitigation: Handle `flex-wrap` or stack elements vertically if space is insufficient.

## Security Considerations
- N/A

## Next Steps
- Move to [phase-04](./phase-04-mobile-responsive-polish.md)
