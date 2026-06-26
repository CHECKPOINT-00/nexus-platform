"use client";

import React from "react";
import { useStore } from "@tanstack/react-form";
import { usePackages } from "@/hooks/usePackages";
import { IntakeStep, IntakeData } from "../_types/intake.types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Card, Button } from "@heroui/react";
import { ServicePackage } from "@/types";
import { ArrowLeft, ArrowRight, Bot, Send } from "lucide-react";

// Import step components
import SituationStep from "./Steps/SituationStep";
import ContactStep from "./Steps/ContactStep";
import ProjectContextStep from "./Steps/ProjectContextStep";
import SupportNeedsStep from "./Steps/SupportNeedsStep";
import DocumentInputStep from "./Steps/DocumentInputStep";
import DeadlineStep from "./Steps/DeadlineStep";
import BoundaryStep from "./Steps/BoundaryStep";
import ReviewSubmitStep from "./Steps/ReviewSubmitStep";

export const checkStepValidity = (step: IntakeStep, values: any): boolean => {
  switch (step) {
    case IntakeStep.PACKAGE:
      return !!values.package_id;
    case IntakeStep.SITUATION:
      return !!values.case_summary && values.case_summary.length >= 20;
    case IntakeStep.CONTACT:
      return (
        !!values.contact?.full_name &&
        values.contact.full_name.trim().length >= 2 &&
        !!values.contact?.student_code &&
        values.contact.student_code.trim().length >= 5 &&
        !!values.contact?.team_role &&
        !!values.contact?.zalo &&
        /^\d{10}$/.test(values.contact.zalo.trim()) &&
        !!values.contact?.email &&
        values.contact.email.includes("@")
      );
    case IntakeStep.PROJECT_CONTEXT:
      return true; // Optional context step
    case IntakeStep.SUPPORT_NEEDS:
      return !!values.support_needs?.primary_need && (!values.expected_outputs || values.expected_outputs.length >= 5);
    case IntakeStep.DOCUMENTS:
      return (
        Array.isArray(values.documents) &&
        values.documents.length > 0 &&
        values.documents.every(
          (d: any) =>
            !!d.drive_url &&
            d.drive_url.trim().length > 0 &&
            /^https?:\/\/(drive|docs)\.google\.com\/.*/.test(d.drive_url) &&
            !!d.document_type &&
            d.document_type.trim().length > 0
        )
      );
    case IntakeStep.DEADLINE: {
      const deadlineVal = values.deadline;
      if (deadlineVal) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(deadlineVal);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate <= today) return false;
      }
      return true;
    }
    case IntakeStep.BOUNDARY:
      return Array.isArray(values.boundary_confirmations) && values.boundary_confirmations.length >= 3;
    case IntakeStep.REVIEW:
      return true;
    default:
      return false;
  }
};

interface IntakeChatFlowProps {
  form: any;
  saveDraft: (values: IntakeData) => void;
  isSubmitting: boolean;
  error: string | null;
  currentStep: IntakeStep;
  setCurrentStep: (step: IntakeStep) => void;
}

export default function IntakeChatFlow({
  form,
  saveDraft,
  isSubmitting,
  error,
  currentStep,
  setCurrentStep,
}: IntakeChatFlowProps) {
  const { data: packages, isLoading: isLoadingPackages } = usePackages();

  // Get current form values to check completion
  const values = useStore(form.store, (state: any) => state.values);

  // Validate current step fields
  const isStepValid = () => checkStepValidity(currentStep, values);

  const handleNext = () => {
    if (isStepValid()) {
      saveDraft(values);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFeaturesList = (features: any): string[] => {
    if (Array.isArray(features)) return features;
    try {
      if (typeof features === "string") {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Bot Header Welcome */}
      <div className="flex gap-4 p-4 rounded-xl bg-brand-soft/20 border border-brand/10">
        <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading font-semibold text-brand text-sm">Nexus CP1 Triage Guide</h4>
          <p className="font-body text-xs text-text-muted leading-relaxed">
            Xin chào! Mình sẽ hướng dẫn bạn hoàn thiện hồ sơ phản biện Checkpoint 1. Hãy thực hiện điền thông tin qua các bước dưới đây để Supporter chuyên môn có đủ thông tin hỗ trợ nhóm bạn tốt nhất.
          </p>
        </div>
      </div>

      {/* Intake Steps Container */}
      <div className="bg-surface-app border border-border-app rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Step 0: Package Selection */}
        {currentStep === IntakeStep.PACKAGE && (
          <div className="space-y-6 font-body">
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-text-app">Chọn gói dịch vụ phản biện</h3>
              <p className="font-body text-xs text-text-muted">
                Lựa chọn gói phản biện giúp hệ thống định hình SLA phản hồi và kết nối Supporter chuyên môn phù hợp.
              </p>
            </div>

            {isLoadingPackages ? (
              <LoadingSkeleton variant="card" count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages?.map((pkg: ServicePackage) => (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      form.setFieldValue("package_id", pkg.id);
                      saveDraft({ ...values, package_id: pkg.id });
                    }}
                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                      values.package_id === pkg.id
                        ? "border-brand bg-brand-soft/10 ring-2 ring-brand/15"
                        : "border-border-app hover:border-brand/40 bg-surface-app"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-heading font-bold text-xs text-text-app">{pkg.name}</span>
                      <input
                        type="radio"
                        name="package_selection"
                        checked={values.package_id === pkg.id}
                        onChange={() => {
                          form.setFieldValue("package_id", pkg.id);
                          saveDraft({ ...values, package_id: pkg.id });
                        }}
                        className="w-4 h-4 text-brand border-border-app focus:ring-brand cursor-pointer"
                        aria-label={pkg.name}
                      />
                    </div>
                    <span className="font-heading font-bold text-brand text-sm mb-2">
                      {formatPrice(pkg.price)}
                    </span>
                    <ul className="text-[10px] text-text-muted space-y-1 pl-4 list-disc font-body">
                      {getFeaturesList(pkg.features).map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Situation & Summary */}
        {currentStep === IntakeStep.SITUATION && (
          <SituationStep form={form} values={values} />
        )}

        {/* Step 2: Contact Info */}
        {currentStep === IntakeStep.CONTACT && (
          <ContactStep form={form} values={values} />
        )}

        {/* Step 3: Project Context */}
        {currentStep === IntakeStep.PROJECT_CONTEXT && (
          <ProjectContextStep form={form} values={values} />
        )}

        {/* Step 4: Support Needs */}
        {currentStep === IntakeStep.SUPPORT_NEEDS && (
          <SupportNeedsStep form={form} values={values} />
        )}

        {/* Step 5: Documents */}
        {currentStep === IntakeStep.DOCUMENTS && (
          <DocumentInputStep form={form} values={values} />
        )}

        {/* Step 6: Deadline & Urgency */}
        {currentStep === IntakeStep.DEADLINE && (
          <DeadlineStep form={form} values={values} />
        )}

        {/* Step 7: Boundaries */}
        {currentStep === IntakeStep.BOUNDARY && (
          <BoundaryStep form={form} values={values} />
        )}

        {/* Step 8: Review & Submit */}
        {currentStep === IntakeStep.REVIEW && (
          <ReviewSubmitStep values={values} packages={packages} error={error} />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border-app">
          <Button
            onPress={handleBack}
            isDisabled={currentStep === 0 || isSubmitting}
            variant="ghost"
            className="border border-border-strong text-text-muted hover:text-text-app font-body font-semibold cursor-pointer flex items-center gap-2 h-9 px-4 rounded-xl text-xs bg-surface-app"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>

          {currentStep === IntakeStep.REVIEW ? (
            <Button
              onPress={() => form.handleSubmit()}
              isDisabled={isSubmitting}
              className="bg-brand text-white font-body font-semibold cursor-pointer hover:bg-brand-hover shadow-sm flex items-center gap-2 h-9 px-4 rounded-xl text-xs"
            >
              <span>{isSubmitting ? "Đang gửi hồ sơ..." : "Xác nhận & Gửi case"}</span>
              <Send className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onPress={handleNext}
              isDisabled={!isStepValid()}
              className="bg-brand text-white font-body font-semibold cursor-pointer hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2 h-9 px-4 rounded-xl text-xs"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
