# Phase 1: Component & Type Setup

## Context Links
- Parent Plan: [plan.md](./plan.md)
- Brainstorm Design: [260706-2327-brainstorm-status-timeline.md](../reports/260706-2327-brainstorm-status-timeline.md)

## Overview
- Priority: P1
- Current status: Completed
- Brief description: Refactor `statusThemeMap` into individual maps, define the `PipelineStepKey`, and create the `getPipelineStep` function. Build the base `CasePipelineStepper` reusable component.

## Key Insights
- The status logic must not break backend DB schemas. We only change how we compute and present statuses in the frontend.
- `Stepper` from Mantine handles horizontal progression perfectly.

## Requirements
- Split `statusThemeMap` into strictly isolated `studentStatusMap` (based on `user_facing_stage`) and `supporterStatusMap` (based on `internal_status`).
- Implement the new Semantic Color system (Red, Amber, Blue, Green, Gray, Dark Gray Outline).
- `getPipelineStep` must compute the Stepper step using ONLY `user_facing_stage` (decoupled from Payment).
- Component `CasePipelineStepper` must render the professional timeline, ignoring payment logic entirely.

## Architecture
- `apps/web-1/types/case.ts` will hold the role-based maps and new semantic color constants.
- `apps/web-1/components/case/CasePipelineStepper.tsx` for the stepper.

## Related Code Files
- Modify: `apps/web-1/types/case.ts`
- Create: `apps/web-1/components/case/CasePipelineStepper.tsx`

## Implementation Steps
1. Open `apps/web-1/types/case.ts`.
2. Extract `statusThemeMap` into `studentStatusMap` and `supporterStatusMap`, applying the new Semantic Colors (e.g. Amber/Orange for waiting-on-user).
3. Define `PIPELINE_STAGES` array ignoring the payment step.
4. Implement `getPipelineStep(stage)` strictly tracking professional progression (intake -> confirm -> review -> report -> revision -> done). Lưu ý: Trong quá trình Revision Loop, bước "Phản biện" cũ vẫn giữ nguyên (xanh/done), chỉ highlight active ở bước cuối "Sửa bài (Vòng X)".
5. Scaffold `CasePipelineStepper.tsx` using `<Stepper>` from `@mantine/core`.

## Todo List
- [x] Refactor case.ts maps
- [x] Write `getPipelineStep` logic
- [x] Create `CasePipelineStepper` base component

## Success Criteria
- Type errors in existing code (due to map changes) are identified and fixed.
- `getPipelineStep` correctly resolves all combinations.

## Risk Assessment
- Existing references to `statusThemeMap` in other files might break.
- Mitigation: Perform a global search (`grep`) for `statusThemeMap` before making breaking changes.

## Security Considerations
- Pure presentation layer change; no auth/security impact.

## Next Steps
- Move to [phase-02](./phase-02-refactor-dashboard-casecard.md) once types are ready.
