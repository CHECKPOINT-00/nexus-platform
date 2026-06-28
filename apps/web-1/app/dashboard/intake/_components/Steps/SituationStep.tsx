"use client";

import React from "react";
import { Textarea, Tooltip } from "@mantine/core";
import { HelpCircle } from "lucide-react";

interface SituationStepProps {
  form: any;
  values: any;
}

export default function SituationStep({ form, values }: SituationStepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Tình huống hiện tại &amp; Tóm tắt dự án</h3>
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
              if (value.length > 2000) return "Tóm tắt dự án không được vượt quá 2000 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <Textarea
                label="Tóm tắt dự án"
                placeholder="Hãy giới thiệu ngắn gọn ý tưởng dự án của bạn (ví dụ: Nền tảng kết nối gia sư với học sinh thông qua ứng dụng định vị và đánh giá chất lượng...)"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={5000} // prevent browser crash but allow exceeding 2000 to show error
                minRows={3}
                autosize
                radius="md"
                classNames={{ input: "break-words break-all whitespace-normal" }}
              />
            );
          }}
        </form.Field>

        <form.Field
          name="current_situations"
          validators={{
            onChange: ({ value }: { value: string[] }) => {
              const joined = value ? value.join("\n") : "";
              if (joined.length > 2000) {
                return "Bối cảnh thực tế không được vượt quá 2000 ký tự.";
              }
              return undefined;
            }
          }}
        >
          {(field: any) => {
            const rawSituationsValue = field.state.value?.join("\n") || "";
            const hasError = (field.state.meta.isTouched || !!rawSituationsValue) && !!field.state.meta.errors.length;
            return (
              <Textarea
                label={
                  <div className="flex items-center gap-1.5">
                    <span>Bối cảnh thực tế</span>
                    <Tooltip
                      label="Mô tả bối cảnh hoặc tình huống thực tế dẫn tới dự án của bạn (ví dụ: khó khăn của khách hàng, vấn đề của thị trường). Hãy nhập mỗi bối cảnh trên một dòng mới."
                      multiline
                      w={220}
                      withArrow
                    >
                      <span className="flex items-center">
                        <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                      </span>
                    </Tooltip>
                  </div>
                }
                placeholder="Ví dụ:&#10;Sinh viên sư phạm khó tìm lớp dạy thêm phù hợp.&#10;Phụ huynh lo lắng về chất lượng dạy của gia sư tự do."
                value={rawSituationsValue}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const val = e.target.value;
                  // Fix array newline bug by not filtering out empty lines immediately
                  const arr = val.split("\n");
                  field.handleChange(arr);
                }}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={5000} // prevent browser crash but allow exceeding 2000 to show error
                minRows={3}
                autosize
                radius="md"
                classNames={{ input: "break-words break-all whitespace-normal" }}
              />
            );
          }}
        </form.Field>
      </div>
    </div>
  );
}

