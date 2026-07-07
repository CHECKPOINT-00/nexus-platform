"use client";

import React from "react";
import { IntakeStep } from "../_types/intake.types";
import { Check } from "lucide-react";

import { Stepper } from "@mantine/core";

interface IntakeProgressStepperProps {
  currentStep: IntakeStep;
  onStepClick?: (step: IntakeStep) => void;
  selectableSteps?: IntakeStep[];
}

const steps = [
  { step: IntakeStep.PACKAGE, label: "Gói dịch vụ" },
  { step: IntakeStep.SITUATION, label: "Vấn đề" },
  { step: IntakeStep.CONTACT, label: "Liên hệ" },
  { step: IntakeStep.PROJECT_CONTEXT, label: "Nhóm" },
  { step: IntakeStep.SUPPORT_NEEDS, label: "Hỗ trợ" },
  { step: IntakeStep.DOCUMENTS, label: "Tài liệu" },
  { step: IntakeStep.DEADLINE, label: "Hạn chót" },
  { step: IntakeStep.BOUNDARY, label: "Ranh giới" },
  { step: IntakeStep.REVIEW, label: "Xác nhận" },
];

export default function IntakeProgressStepper({
  currentStep,
  onStepClick,
  selectableSteps = [],
}: IntakeProgressStepperProps) {
  return (
    <>
      <div className="hidden lg:flex flex-col w-full bg-surface-app border border-border-app rounded-2xl p-5 shadow-sm">
        <Stepper
          active={currentStep}
          onStepClick={(index) => {
            const s = steps[index];
            if (s && selectableSteps.includes(s.step)) {
              onStepClick?.(s.step);
            }
          }}
          color="brand"
          orientation="vertical"
          size="sm"
          completedIcon={<Check className="w-3.5 h-3.5 stroke-[3]" />}
          classNames={{
            root: "w-full",
            steps: "gap-0",
            step: "group py-2.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed hover:bg-transparent focus:outline-none",
            stepIcon: "border-border-app bg-surface-app text-text-subtle font-semibold transition-all duration-200 data-[progress]:ring-4 data-[progress]:ring-brand-soft/30",
            stepCompletedIcon: "text-white",
            separator: "bg-border-app",
            verticalSeparator: "bg-border-app w-[2px]",
          }}
        >
          {steps.map((s, idx) => {
            const isActive = s.step === currentStep;
            const isCompleted = s.step < currentStep;
            const isSelectable = selectableSteps.includes(s.step);

            return (
              <Stepper.Step
                key={idx}
                allowStepClick={isSelectable}
                allowStepSelect={isSelectable}
                label={
                  <span
                    className={`font-heading text-xs font-bold leading-tight transition-colors duration-200 ${
                      isActive
                        ? "text-brand font-bold"
                        : isSelectable
                        ? "text-text-app group-hover:text-brand"
                        : "text-text-subtle/60"
                    }`}
                  >
                    {s.label}
                  </span>
                }
                description={
                  <span
                    className={`text-[10px] leading-none mt-1 block transition-colors duration-200 ${
                      isActive
                        ? "text-brand/85 font-medium"
                        : isCompleted
                        ? "text-brand/60"
                        : "text-text-muted/70"
                    }`}
                  >
                    {isActive
                      ? "Đang thực hiện"
                      : isCompleted
                      ? "Đã hoàn thành"
                      : isSelectable
                      ? "Sẵn sàng"
                      : "Chưa mở khóa"}
                  </span>
                }
              />
            );
          })}
        </Stepper>
      </div>

      <div className="lg:hidden w-full py-3 border-b border-border-app bg-surface-app px-4 mb-4">
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1">
          {steps.map((s, idx) => {
            const isActive = s.step === currentStep;
            const isCompleted = s.step < currentStep;
            const isSelectable = selectableSteps.includes(s.step);

            return (
              <button
                key={idx}
                onClick={() => isSelectable && onStepClick?.(s.step)}
                disabled={!isSelectable}
                className="flex items-center shrink-0 gap-1.5 focus:outline-none"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors ${
                    isActive
                      ? "bg-brand text-white"
                      : isCompleted
                      ? "bg-brand text-white"
                      : "bg-surface-muted text-text-subtle border border-border-app"
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                </span>
                <span
                  className={`text-[11px] font-heading font-semibold whitespace-nowrap ${
                    isActive ? "text-brand font-bold" : isCompleted ? "text-text-app font-medium" : "text-text-subtle font-normal"
                  }`}
                >
                  {s.label}
                </span>
                {idx < steps.length - 1 && <span className="text-text-subtle/30 mx-1 text-[10px]">/</span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
