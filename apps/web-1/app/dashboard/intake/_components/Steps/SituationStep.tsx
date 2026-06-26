"use client";

import React from "react";
import { TextField, TextArea, Label, FieldError, Tooltip } from "@heroui/react";
import { HelpCircle } from "lucide-react";

interface SituationStepProps {
  form: any;
  values: any;
}

export default function SituationStep({ form, values }: SituationStepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Tình huống hiện tại & Tóm tắt dự án</h3>
        <p className="font-body text-xs text-text-muted">
          Giải thích bối cảnh, lý do nhóm chọn đề tài này và tóm tắt ngắn gọn giải pháp.
        </p>
      </div>

      <div className="space-y-4">
        <form.Field
          name="case_summary"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return "Tóm tắt dự án không được để trống";
              if (value.length < 20) return "Tóm tắt dự án tối thiểu phải 20 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-text-app">Tóm tắt dự án</Label>
                <TextArea
                  placeholder="Hãy giới thiệu ngắn gọn ý tưởng dự án của bạn (ví dụ: Nền tảng kết nối gia sư với học sinh thông qua ứng dụng định vị và đánh giá chất lượng...)"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                  className={`w-full bg-surface-soft border rounded-lg text-xs font-body text-text-app focus:outline-none px-3 py-2 min-h-20 transition-all ${
                    hasError
                      ? "border-danger focus:border-danger ring-1 ring-danger/20"
                      : "border-border-strong focus:border-brand"
                  }`}
                />
                <FieldError className="text-[10px] text-danger font-body font-semibold pl-1">
                  {field.state.meta.errors[0]}
                </FieldError>
              </TextField>
            );
          }}
        </form.Field>

        <form.Field name="current_situations">
          {(field: any) => {
            const rawSituationsValue = field.state.value?.join("\n") || "";
            return (
              <TextField className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold text-text-app">
                    Bối cảnh thực tế
                  </Label>
                  <Tooltip delay={0} closeDelay={0}>
                    <Tooltip.Trigger>
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                      Mô tả bối cảnh hoặc tình huống thực tế dẫn tới dự án của bạn (ví dụ: khó khăn của khách hàng, vấn đề của thị trường). Hãy nhập mỗi bối cảnh trên một dòng mới.
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <TextArea
                  placeholder="Ví dụ:&#10;Sinh viên sư phạm khó tìm lớp dạy thêm phù hợp.&#10;Phụ huynh lo lắng về chất lượng dạy của gia sư tự do."
                  value={rawSituationsValue}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const arr = e.target.value.split("\n").filter((line) => line.trim().length > 0);
                    field.handleChange(arr);
                  }}
                  className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 py-2 min-h-24"
                />
              </TextField>
            );
          }}
        </form.Field>
      </div>
    </div>
  );
}

