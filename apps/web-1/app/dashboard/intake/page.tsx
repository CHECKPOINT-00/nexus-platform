"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useIntakeForm } from "./hooks/useIntakeForm";
import IntakeProgressStepper from "./_components/IntakeProgressStepper";
import IntakeChatFlow from "./_components/IntakeChatFlow";
import { IntakeStep } from "./_types/intake.types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

function IntakePageContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const { form, isLoaded, saveDraft, isSubmitting, error } = useIntakeForm(packageId);
  const [currentStep, setCurrentStep] = useState<IntakeStep>(IntakeStep.PACKAGE);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <LoadingSkeleton variant="text-block" count={2} />
        <p className="mt-4 text-sm text-text-muted font-body animate-pulse">Đang tải cấu hình biểu mẫu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-app">Cung cấp thông tin dự án</h1>
        <p className="font-body text-sm text-text-muted max-w-lg mx-auto">
          Cấu trúc ý tưởng và thông tin minh chứng để bắt đầu chạy phản biện.
        </p>
      </div>

      <IntakeProgressStepper currentStep={currentStep} />

      <IntakeChatFlow
        form={form}
        saveDraft={saveDraft}
        isSubmitting={isSubmitting}
        error={error}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <LoadingSkeleton variant="text-block" count={2} />
          <p className="mt-4 text-sm text-text-muted font-body animate-pulse">Đang tải...</p>
        </div>
      }
    >
      <IntakePageContent />
    </Suspense>
  );
}
