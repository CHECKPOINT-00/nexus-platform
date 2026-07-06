# Brainstorm: Status Separation & Semantic Color System

## 1. Problem Statement & Requirements
1. **Role-based Status Leakage**: User and Supporter currently share the same status map, causing users to see irrelevant internal states.
2. **Case Status vs Payment Status Overlap**: Payment runs parallel to case progression (e.g., Supporter can review while payment is pending). Merging them into a single timeline creates a false dependency (Gatekeeper).
3. **Color System**: Need a glanceable semantic color system that clearly indicates "who needs to take action".

## 2. Evaluated Approaches (Case vs Payment)

### Approach A: Gatekeeper (Merged Pipeline)
- **Concept**: Halt progression at "Payment" step until paid.
- **Pros**: Linear, easy to understand.
- **Cons**: Factually incorrect if supporters work concurrently; hides actual case progress.

### Approach B: Badge + Banner Separation (Selected)
- **Concept**: `Case Status` badge strictly tracks professional progress (Intake -> Review -> Report). `Payment Status` operates as an independent, high-priority alert Banner/Icon.
- **Pros**: Accurate to business logic. Solves overlap natively.
- **Cons**: Requires UI real estate for the alert banner.

### Approach C: Priority Enum (Single Computed Badge)
- **Concept**: Show payment warning if unpaid, otherwise show case progress.
- **Pros**: Saves UI space.
- **Cons**: Hides case progress when payment is pending, confusing the user.

## 3. Final Recommended Solution

1. **Role Isolation (Issue 1)**: 
   - Decouple `statusThemeMap` into `studentStatusMap` and `supporterStatusMap`.
   - Admin/Supporter view uses `internal_status`. Student view uses `user_facing_stage`. Never mix them in the UI.

2. **Decoupled Progression (Issue 2)**: 
   - **Timeline/Stepper**: Strictly driven by `user_facing_stage` (Chuyên môn).
   - **Payment Alert**: Driven by `payment_status`. Rendered as a sticky warning banner (⚠️ Cần thanh toán) at the top of the workspace and a warning icon on the CaseCard.

3. **Semantic Color System (Issue 3)**:
   - 🔴 **Red (Danger)**: Failed / Rejected (System/Admin blocked).
   - 🟠 **Amber/Orange (Warning)**: Waiting for **USER** action (Needs Revision, Unpaid). *Note: Upgraded from Yellow for A11y contrast.*
   - 🔵 **Blue (Info/Primary)**: Waiting for **SYSTEM/SUPPORTER** (Under Review, Processing).
   - 🟢 **Green (Success)**: Completed / Verified.
   - 🔘 **Dark Gray (Outline)**: Cancelled by user.
   - ⚪ **Light Gray**: Draft / Future steps.
   - *A11y Requirement*: Always pair color with an icon and text label (e.g., `✖ Từ chối`).

## 4. Implementation Considerations & Risks
- **Contrast**: Using Amber instead of Yellow ensures text readability in both Light/Dark modes.
- **Stepper Update**: The Stepper planned previously must be refactored to remove "Payment" as a core step, turning it into an overarching alert instead.

## 5. Success Metrics
- 0 cases where users are confused about who needs to act next.
- Supporter states never leak into the Student dashboard.
- Payment status correctly overlays case progress without masking it.

## 6. Next Steps & Dependencies
- Refactor the previous implementation plan to reflect the separated Status + Banner logic.
- Update `apps/web-1/types/case.ts` with the new color mappings and role-based maps.
