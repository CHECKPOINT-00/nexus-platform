import { CheckCircle } from "lucide-react";
import { STEPS } from "../types";

interface StepSidebarProps {
  currentStepIdx: number;
}

export function StepSidebar({ currentStepIdx }: StepSidebarProps) {
  return (
    <div className="hidden lg:flex flex-col gap-2 p-4 border border-default-200/50 bg-surface rounded-lg">
      <h2 className="text-md font-bold mb-4 font-display">Tiến độ đăng ký</h2>
      {STEPS.map((step, idx) => {
        const isActive = idx === currentStepIdx;
        const isCompleted = idx < currentStepIdx;
        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-2.5 rounded-md text-sm transition-all ${
              isActive
                ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 font-bold"
                : "text-default-500"
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-success-500 shrink-0" />
            ) : (
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 border ${
                  isActive ? "border-orange-500 text-orange-500" : "border-default-300"
                }`}
              >
                {idx + 1}
              </span>
            )}
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
