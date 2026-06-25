"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@tanstack/react-form";
import { usePackages } from "@/hooks/usePackages";
import { IntakeStep, IntakeData } from "../_types/intake.types";
import DriveValidatorInput from "./DriveValidatorInput";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Card, Input, TextArea, Button, RadioGroup, Radio, Label } from "@heroui/react";
import { ServicePackage } from "@/types";
import { ArrowLeft, ArrowRight, Bot, Sparkles, Send, Check } from "lucide-react";

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
  const [driveUrlValid, setDriveUrlValid] = useState(false);

  // Get current form values to check completion
  const values = useStore(form.store, (state: any) => state.values);

  // Validate current step fields
  const isStepValid = () => {
    switch (currentStep) {
      case IntakeStep.PACKAGE:
        return !!values.package_id;
      case IntakeStep.IDEA:
        return !!values.idea && values.idea.length >= 10;
      case IntakeStep.PAIN_POINT:
        return !!values.pain_point && values.pain_point.length >= 10;
      case IntakeStep.CUSTOMER:
        return !!values.customer && values.customer.length >= 10;
      case IntakeStep.DRIVE_URL:
        return !!values.drive_url && driveUrlValid;
      case IntakeStep.REVIEW:
        return true;
      default:
        return false;
    }
  };

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
      <div className="flex gap-4 p-4 rounded-xl bg-brand-subtle/50 border border-brand/10">
        <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading font-semibold text-brand text-sm">Nexus Mentor</h4>
          <p className="font-body text-xs text-text-muted leading-relaxed">
            Xin chào! Mình sẽ đồng hành cùng bạn để cấu trúc ý tưởng khởi nghiệp. Hãy hoàn thành các câu hỏi dưới đây để bắt đầu chạy phản biện.
          </p>
        </div>
      </div>

      {/* Intake Steps Container */}
      <div className="bg-surface-app border border-border-app rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Step 0: Package Selection */}
        {currentStep === IntakeStep.PACKAGE && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-text-app">Bước 1: Chọn gói dịch vụ phản biện</h3>
              <p className="font-body text-sm text-text-muted">
                Lựa chọn gói dịch vụ để xác định các tiêu chí phản biện và mức độ hỗ trợ từ supporter.
              </p>
            </div>

            {isLoadingPackages ? (
              <LoadingSkeleton variant="card" count={3} />
            ) : (
              <RadioGroup
                value={values.package_id}
                onChange={(val: any) => {
                  form.setFieldValue("package_id", val);
                  saveDraft({ ...values, package_id: val });
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {packages?.map((pkg: ServicePackage) => (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      form.setFieldValue("package_id", pkg.id);
                      saveDraft({ ...values, package_id: pkg.id });
                    }}
                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                      values.package_id === pkg.id
                        ? "border-brand bg-brand-subtle/20 ring-2 ring-brand/10"
                        : "border-border-app hover:border-brand/40 bg-surface-app"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-heading font-bold text-sm text-text-app">{pkg.name}</span>
                      <Radio value={pkg.id} aria-label={pkg.name} />
                    </div>
                    <span className="font-heading font-semibold text-brand text-base mb-1">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Optional Team / School Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border-app">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="team_name" className="text-xs font-semibold text-text-app font-body">Tên nhóm (Tùy chọn)</Label>
                <Input
                  id="team_name"
                  value={values.team_name}
                  onChange={(e) => {
                    form.setFieldValue("team_name", e.target.value);
                    saveDraft({ ...values, team_name: e.target.value });
                  }}
                  placeholder="Ví dụ: GenZ Tech"
                  className="w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="school" className="text-xs font-semibold text-text-app font-body">Trường học (Tùy chọn)</Label>
                <Input
                  id="school"
                  value={values.school}
                  onChange={(e) => {
                    form.setFieldValue("school", e.target.value);
                    saveDraft({ ...values, school: e.target.value });
                  }}
                  placeholder="Ví dụ: Đại học FPT"
                  className="w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="course_context" className="text-xs font-semibold text-text-app font-body">Mã môn học (Tùy chọn)</Label>
                <Input
                  id="course_context"
                  value={values.course_context}
                  onChange={(e) => {
                    form.setFieldValue("course_context", e.target.value);
                    saveDraft({ ...values, course_context: e.target.value });
                  }}
                  placeholder="Ví dụ: EXE101"
                  className="w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Idea Description */}
        {currentStep === IntakeStep.IDEA && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-text-app">Bước 2: Tóm tắt ý tưởng khởi nghiệp</h3>
              <p className="font-body text-sm text-text-muted">
                Hãy giải thích giải pháp của bạn là gì, nó hoạt động ra sao và mang lại giá trị gì đặc biệt?
              </p>
            </div>
            <TextArea
              value={values.idea}
              onChange={(e) => {
                form.setFieldValue("idea", e.target.value);
                saveDraft({ ...values, idea: e.target.value });
              }}
              placeholder="Giải pháp của chúng tôi là một nền tảng hỗ trợ sinh viên học lập trình thông qua..."
              className="w-full bg-surface-soft border border-border-app rounded-lg text-sm p-3 font-body text-text-app focus:outline-brand min-h-[140px]"
            />
            {values.idea && values.idea.length < 10 && (
              <p className="text-xs text-danger font-body">Mô tả phải dài ít nhất 10 ký tự.</p>
            )}
          </div>
        )}

        {/* Step 2: Pain Point */}
        {currentStep === IntakeStep.PAIN_POINT && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-text-app">Bước 3: Vấn đề thị trường (Pain Point)</h3>
              <p className="font-body text-sm text-text-muted">
                Vấn đề nhức nhối nào của khách hàng mà dự án của bạn đang giải quyết? Tại sao họ cần nó?
              </p>
            </div>
            <TextArea
              value={values.pain_point}
              onChange={(e) => {
                form.setFieldValue("pain_point", e.target.value);
                saveDraft({ ...values, pain_point: e.target.value });
              }}
              placeholder="Sinh viên gặp khó khăn lớn trong việc duy trì động lực tự học lập trình, thiếu lộ trình và không có người phản hồi..."
              className="w-full bg-surface-soft border border-border-app rounded-lg text-sm p-3 font-body text-text-app focus:outline-brand min-h-[140px]"
            />
            {values.pain_point && values.pain_point.length < 10 && (
              <p className="text-xs text-danger font-body">Mô tả phải dài ít nhất 10 ký tự.</p>
            )}
          </div>
        )}

        {/* Step 3: Target Customer */}
        {currentStep === IntakeStep.CUSTOMER && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-text-app">Bước 4: Chân dung khách hàng mục tiêu</h3>
              <p className="font-body text-sm text-text-muted">
                Ai sẽ là người trực tiếp trả tiền hoặc sử dụng sản phẩm của bạn đầu tiên?
              </p>
            </div>
            <TextArea
              value={values.customer}
              onChange={(e) => {
                form.setFieldValue("customer", e.target.value);
                saveDraft({ ...values, customer: e.target.value });
              }}
              placeholder="Sinh viên CNTT năm 1 và năm 2 tại các trường Đại học công nghệ có mong muốn tự học..."
              className="w-full bg-surface-soft border border-border-app rounded-lg text-sm p-3 font-body text-text-app focus:outline-brand min-h-[140px]"
            />
            {values.customer && values.customer.length < 10 && (
              <p className="text-xs text-danger font-body">Mô tả phải dài ít nhất 10 ký tự.</p>
            )}
          </div>
        )}

        {/* Step 4: Google Drive Document */}
        {currentStep === IntakeStep.DRIVE_URL && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-text-app">Bước 5: Tài liệu minh chứng (Google Drive)</h3>
              <p className="font-body text-sm text-text-muted">
                Dán đường dẫn thư mục hoặc file Google Drive chứa slide pitching, bài làm môn học hoặc thuyết minh dự án.
              </p>
            </div>
            <DriveValidatorInput
              value={values.drive_url}
              onChange={(val) => {
                form.setFieldValue("drive_url", val);
                saveDraft({ ...values, drive_url: val });
              }}
              onValidStateChange={setDriveUrlValid}
            />
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === IntakeStep.REVIEW && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-text-app">Bước cuối: Xác nhận thông tin dự án</h3>
              <p className="font-body text-sm text-text-muted">
                Vui lòng kiểm tra kỹ các thông tin đã điền trước khi nộp hồ sơ chạy phản biện.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-danger-soft border border-danger/20 text-danger rounded-lg text-xs font-body">
                {error}
              </div>
            )}

            <div className="space-y-4 border border-border-app rounded-xl p-4 bg-surface-soft/40 divide-y divide-border-app text-sm font-body">
              <div className="pb-3 flex justify-between items-center">
                <span className="font-semibold text-text-muted">Gói dịch vụ đăng ký</span>
                <span className="font-bold text-brand">
                  {packages?.find((p: ServicePackage) => p.id === values.package_id)?.name || "Gói dịch vụ"}
                </span>
              </div>
              {values.team_name && (
                <div className="py-3 flex justify-between items-center">
                  <span className="font-semibold text-text-muted">Tên nhóm</span>
                  <span className="text-text-app">{values.team_name}</span>
                </div>
              )}
              {values.school && (
                <div className="py-3 flex justify-between items-center">
                  <span className="font-semibold text-text-muted">Trường học</span>
                  <span className="text-text-app">{values.school}</span>
                </div>
              )}
              <div className="py-3 space-y-1.5">
                <span className="font-semibold text-text-muted block">Ý tưởng dự án</span>
                <p className="text-xs text-text-muted leading-relaxed truncate-3-lines">{values.idea}</p>
              </div>
              <div className="py-3 space-y-1.5">
                <span className="font-semibold text-text-muted block">Vấn đề giải quyết</span>
                <p className="text-xs text-text-muted leading-relaxed truncate-3-lines">{values.pain_point}</p>
              </div>
              <div className="py-3 space-y-1.5">
                <span className="font-semibold text-text-muted block">Khách hàng mục tiêu</span>
                <p className="text-xs text-text-muted leading-relaxed truncate-3-lines">{values.customer}</p>
              </div>
              <div className="pt-3 space-y-1">
                <span className="font-semibold text-text-muted block">Liên kết tài liệu Drive</span>
                <a
                  href={values.drive_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-brand hover:underline break-all"
                >
                  {values.drive_url}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border-app">
          <Button
            onPress={handleBack}
            isDisabled={currentStep === 0 || isSubmitting}
            variant="ghost"
            className="border border-border-strong text-text-muted hover:text-text-app font-body font-semibold cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>

          {currentStep === IntakeStep.REVIEW ? (
            <Button
              onPress={() => form.handleSubmit()}
              isDisabled={isSubmitting}
              className="bg-brand text-white font-body font-semibold cursor-pointer hover:bg-brand-hover shadow-sm flex items-center gap-2"
            >
              <span>{isSubmitting ? "Đang xử lý..." : "Nộp & Chạy phản biện"}</span>
              <Send className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onPress={handleNext}
              isDisabled={!isStepValid()}
              className="bg-brand text-white font-body font-semibold cursor-pointer hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2"
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
