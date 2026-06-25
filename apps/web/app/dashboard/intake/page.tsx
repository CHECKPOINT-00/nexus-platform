"use client";

import { Card, Spinner } from "@heroui/react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useIntakeForm } from "./hooks/use-intake-form";
import { StepSidebar } from "./_components/step-sidebar";
import { StepMobileBar } from "./_components/step-mobile-bar";
import { StepPackage } from "./_components/step-package";
import { StepContext } from "./_components/step-context";
import { StepIdea } from "./_components/step-idea";
import { StepCustomerPain } from "./_components/step-customer-pain";
import { StepAlternatives } from "./_components/step-alternatives";
import { StepDocument } from "./_components/step-document";
import { FormNavigation } from "./_components/form-navigation";

export default function IntakePage() {
  const form = useIntakeForm();

  if (form.loadingPackages) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-default-500">Đang tải cấu hình biểu mẫu...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto py-4">
      {/* Sidebar / Mobile Progress */}
      <div className="w-full lg:w-1/4 shrink-0">
        <StepSidebar currentStepIdx={form.currentStepIdx} />
        <StepMobileBar currentStepIdx={form.currentStepIdx} />
      </div>

      {/* Main Form */}
      <div className="flex-1 flex flex-col gap-6">
        <Card className="border border-default-200/50 bg-surface shadow-none rounded-md">
          <Card.Header className="border-b border-default-100 p-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold font-display text-default-800">
                Đăng ký dự án phản biện mới
              </h1>
              <p className="text-xs text-default-400 mt-1">
                Các câu trả lời sẽ được dùng làm dữ liệu đầu vào cho AI và Supporter phản biện.
              </p>
            </div>
            <span className="bg-success-50 dark:bg-success-950/20 text-success-600 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Bản nháp tự động lưu
            </span>
          </Card.Header>

          <Card.Content className="p-6 flex flex-col gap-6">
            {/* Step content */}
            {form.activeStep === "package" && (
              <StepPackage
                packageId={form.packageId}
                packages={form.packages}
                onSelect={(id) => { form.setPackageId(id); form.saveDraft(); }}
              />
            )}
            {form.activeStep === "context" && (
              <StepContext
                teamName={form.teamName}
                school={form.school}
                courseContext={form.courseContext}
                onTeamNameChange={(v) => { form.setTeamName(v); form.saveDraft(); }}
                onSchoolChange={(v) => { form.setSchool(v); form.saveDraft(); }}
                onCourseContextChange={(v) => { form.setCourseContext(v); form.saveDraft(); }}
              />
            )}
            {form.activeStep === "idea" && (
              <StepIdea
                idea={form.idea}
                onIdeaChange={(v) => { form.setIdea(v); form.saveDraft(); }}
              />
            )}
            {form.activeStep === "customer_pain" && (
              <StepCustomerPain
                customer={form.customer}
                painPoint={form.painPoint}
                onCustomerChange={(v) => { form.setCustomer(v); form.saveDraft(); }}
                onPainPointChange={(v) => { form.setPainPoint(v); form.saveDraft(); }}
              />
            )}
            {form.activeStep === "alternatives" && (
              <StepAlternatives
                alternatives={form.alternatives}
                teamCapability={form.teamCapability}
                onAlternativesChange={(v) => { form.setAlternatives(v); form.saveDraft(); }}
                onTeamCapabilityChange={(v) => { form.setTeamCapability(v); form.saveDraft(); }}
              />
            )}
            {form.activeStep === "document" && (
              <StepDocument
                driveUrl={form.driveUrl}
                driveValidationError={form.driveValidationError}
                onDriveUrlChange={(v) => { form.setDriveUrl(v); form.saveDraft(); }}
                onClearError={() => form.setDriveValidationError("")}
              />
            )}

            {/* Global form error */}
            {form.formError && (
              <p className="text-xs text-danger-500 bg-danger-50 dark:bg-danger-900/10 p-3 rounded border border-danger-200/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {form.formError}
              </p>
            )}

            <FormNavigation
              currentStepIdx={form.currentStepIdx}
              loading={form.loading}
              onPrev={form.handlePrev}
              onNext={form.handleNext}
              onSubmit={form.handleSubmit}
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
