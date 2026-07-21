# Researcher 01 — Demo path report

## Scope
Customer-facing MVP demo path in `apps/web-1`.

## Sources checked
- `docs/codebase-summary.md`
- `docs/code-standards.md`
- `docs/archive/system-architecture.md`
- `apps/web-1/app/dashboard/intake/_components/IntakeChatFlow.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/SituationStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/SupportNeedsStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/ReviewSubmitStep.tsx`
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`

## Findings
1. Intake story split between service intake and generic form wizard.
   - Step framing in `IntakeChatFlow.tsx` and `IntakeProgressStepper.tsx` still reads like generic multi-step form, not one coherent “Hồ sơ phản biện” flow.

2. Problem statement and expected value not sharp enough.
   - `SituationStep.tsx` asks for `case_summary` and `current_situations`, but copy still broad.
   - `SupportNeedsStep.tsx` asks for `primary_need` and `expected_outputs`, but user value is not phrased as “kết quả phản biện nhóm cần nhận”.

3. Documents already exist as strong evidence layer but are not central in story.
   - `DocumentInputStep.tsx` validates Drive/doc links well.
   - Review flow still treats docs as one section among many, not as support evidence that enables review quality.

4. Review screen tells data summary, not service promise.
   - `ReviewSubmitStep.tsx` compiles fields correctly.
   - Ordering and labels do not strongly reinforce: problem -> needed support -> evidence -> expected outcome.

5. Case list/detail language likely confuses demo audience.
   - `CaseCard.tsx` and `CaseStatusHeader.tsx` expose status language closer to internal ops than customer narrative.
   - Customer should understand current state and next action in seconds.

## Recommended focus
1. Reframe intake copy around one term: `Hồ sơ phản biện`.
2. Tighten `SituationStep` and `SupportNeedsStep` wording so customer pain + desired result become obvious.
3. Make document step and review step emphasize evidence quality and supporter readiness.
4. Normalize customer-facing status labels in case card/header.
5. Keep architecture; avoid schema rewrite before demo.

## Unresolved questions
- None blocking for planning.
