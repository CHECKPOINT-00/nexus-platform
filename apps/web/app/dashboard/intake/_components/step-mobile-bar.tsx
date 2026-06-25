import { STEPS } from "../types";

interface StepMobileBarProps {
  currentStepIdx: number;
}

export function StepMobileBar({ currentStepIdx }: StepMobileBarProps) {
  return (
    <div className="lg:hidden flex justify-between items-center px-4 py-2 bg-surface border border-default-200/50 rounded-lg">
      <span className="text-xs text-default-500">
        Bước {currentStepIdx + 1}/{STEPS.length}
      </span>
      <span className="text-sm font-bold font-display text-orange-600">
        {STEPS[currentStepIdx]?.label || ""}
      </span>
      <div className="w-24 bg-default-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-orange-500 h-full transition-all"
          style={{ width: `${((currentStepIdx + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
