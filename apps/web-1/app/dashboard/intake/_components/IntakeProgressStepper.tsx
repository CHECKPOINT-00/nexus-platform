"use client";

import React from "react";
import { IntakeStep } from "../_types/intake.types";

interface IntakeProgressStepperProps {
  currentStep: IntakeStep;
}

const steps = [
  { step: IntakeStep.PACKAGE, label: "Gói dịch vụ" },
  { step: IntakeStep.IDEA, label: "Ý tưởng" },
  { step: IntakeStep.PAIN_POINT, label: "Vấn đề" },
  { step: IntakeStep.CUSTOMER, label: "Khách hàng" },
  { step: IntakeStep.DRIVE_URL, label: "Tài liệu" },
  { step: IntakeStep.REVIEW, label: "Xác nhận" },
];

export default function IntakeProgressStepper({ currentStep }: IntakeProgressStepperProps) {
  return (
    <div className="w-full py-4 border-b border-border-app bg-surface-app/40">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
        {steps.map((s, idx) => {
          const isActive = s.step === currentStep;
          const isCompleted = s.step < currentStep;

          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold font-body transition-colors ${
                    isActive
                      ? "bg-brand text-white"
                      : isCompleted
                      ? "bg-brand-soft text-brand"
                      : "bg-surface-muted text-text-subtle border border-border-app"
                  }`}
                >
                  {idx + 1}
                </span>
                <span
                  className={`text-xs font-body hidden md:inline font-medium ${
                    isActive ? "text-brand" : isCompleted ? "text-text-app" : "text-text-subtle"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-grow h-0.5 mx-2 md:mx-4 transition-colors hidden sm:block ${
                    isCompleted ? "bg-brand" : "bg-border-app"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
