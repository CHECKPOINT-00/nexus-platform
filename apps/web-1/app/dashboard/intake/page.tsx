"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@tanstack/react-form";
import { useIntakeForm } from "./hooks/useIntakeForm";
import IntakeProgressStepper from "./_components/IntakeProgressStepper";
import IntakeChatFlow, { checkStepValidity } from "./_components/IntakeChatFlow";
import { IntakeStep } from "./_types/intake.types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Button, Modal } from "@heroui/react";
import { Trash2, AlertTriangle, X } from "lucide-react";

function IntakePageContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const { form, isLoaded, saveDraft, clearDraft, isSubmitting, error } = useIntakeForm(packageId);
  const [currentStep, setCurrentStep] = useState<IntakeStep>(IntakeStep.PACKAGE);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Hook up store value retrieval for validation
  const values = useStore(form.store, (state: any) => state.values);

  // Steps definition for validation tracking
  const stepsList = [
    IntakeStep.PACKAGE,
    IntakeStep.SITUATION,
    IntakeStep.CONTACT,
    IntakeStep.PROJECT_CONTEXT,
    IntakeStep.SUPPORT_NEEDS,
    IntakeStep.DOCUMENTS,
    IntakeStep.DEADLINE,
    IntakeStep.BOUNDARY,
    IntakeStep.REVIEW,
  ];

  // Calculate selectable steps where all preceding steps are valid
  const selectableSteps: IntakeStep[] = [];
  for (let i = 0; i < stepsList.length; i++) {
    const stepVal = stepsList[i];
    if (i === 0) {
      selectableSteps.push(stepVal);
    } else {
      let allPrevValid = true;
      for (let j = 0; j < i; j++) {
        if (!checkStepValidity(stepsList[j], values)) {
          allPrevValid = false;
          break;
        }
      }
      if (allPrevValid) {
        selectableSteps.push(stepVal);
      }
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <LoadingSkeleton variant="text-block" count={2} />
        <p className="mt-4 text-sm text-text-muted font-body animate-pulse">Đang tải cấu hình biểu mẫu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-app">Cung cấp thông tin dự án</h1>
        <p className="font-body text-sm text-text-muted max-w-lg mx-auto">
          Cấu trúc ý tưởng và thông tin minh chứng để bắt đầu chạy phản biện.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Progress Stepper Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 flex flex-col gap-3">
          <IntakeProgressStepper
            currentStep={currentStep}
            selectableSteps={selectableSteps}
            onStepClick={(step) => {
              saveDraft(values);
              setCurrentStep(step);
            }}
          />
          <Button
            onPress={() => setIsResetOpen(true)}
            variant="ghost"
            className="w-full lg:w-full font-body font-semibold cursor-pointer border border-danger/10 hover:border-danger/30 hover:bg-danger-soft/20 text-danger rounded-xl text-xs py-2 flex items-center justify-center gap-1.5 h-10 max-w-[200px] lg:max-w-none mx-auto lg:mx-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa nháp & Nhập lại</span>
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <IntakeChatFlow
            form={form}
            saveDraft={saveDraft}
            isSubmitting={isSubmitting}
            error={error}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetOpen && (
        <Modal>
          <Modal.Backdrop
            isOpen={isResetOpen}
            onOpenChange={setIsResetOpen}
            variant="blur"
          >
            <Modal.Container placement="center">
              <Modal.Dialog className="relative w-full max-w-md bg-surface-app border border-border-app/40 rounded-2xl shadow-2xl flex flex-col outline-none animate-in fade-in zoom-in-95 duration-200 ease-out font-body">
                <Modal.CloseTrigger className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-soft/60 text-text-muted hover:text-text-app transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </Modal.CloseTrigger>

                <Modal.Header className="px-6 pt-6 pb-2 flex items-center gap-2 text-text-app">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
                  <span className="font-heading font-bold text-lg leading-snug">Xác nhận xóa bản nháp</span>
                </Modal.Header>

                <Modal.Body className="px-6 py-2">
                  <p className="text-sm text-text-muted leading-relaxed">
                    Bạn có chắc chắn muốn xóa toàn bộ thông tin nháp đã lưu? Hành động này sẽ đặt lại biểu mẫu về ban đầu và không thể hoàn tác.
                  </p>
                </Modal.Body>

                <Modal.Footer className="px-6 py-6 flex justify-end gap-3">
                  <Button
                    onPress={() => setIsResetOpen(false)}
                    variant="ghost"
                    className="border border-border-strong text-text-muted hover:text-text-app font-body font-semibold cursor-pointer h-10 px-4 rounded-xl text-xs bg-surface-app"
                  >
                    Hủy
                  </Button>
                  <Button
                    onPress={() => {
                      clearDraft();
                      setCurrentStep(IntakeStep.PACKAGE);
                      setIsResetOpen(false);
                    }}
                    className="bg-danger text-white font-body font-semibold cursor-pointer hover:bg-danger-hover shadow-sm h-10 px-4 rounded-xl text-xs"
                  >
                    Xóa nháp
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}
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
