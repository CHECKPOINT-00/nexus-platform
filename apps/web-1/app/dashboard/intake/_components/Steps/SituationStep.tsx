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
        <h3 className="font-heading text-base font-bold text-text-app">Ý tưởng &amp; Vấn đề đang giải quyết</h3>
        <p className="font-body text-xs text-text-muted">
          Giải thích bối cảnh, lý do nhóm chọn đề tài này, vấn đề thực tế đang giải quyết và tóm tắt ngắn gọn giải pháp.
        </p>
      </div>

      <div className="space-y-4">
        <form.Field
          name="case_summary"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return "Mô tả ý tưởng không được để trống";
              if (value.length < 20) return "Mô tả ý tưởng tối thiểu phải 20 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <Textarea
                label="Mô tả ý tưởng &amp; vấn đề giải quyết"
                placeholder="Ví dụ:&#10;Vấn đề: [Phụ huynh khó tìm gia sư uy tín dạy môn đặc thù].&#10;Giải pháp: [Ứng dụng kết nối gia sư có kiểm duyệt hồ sơ bằng AI].&#10;Giá trị: [Giúp phụ huynh an tâm tìm gia sư chất lượng trong 5 phút]."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                minRows={3}
                autosize
                radius="md"
              />
            );
          }}
        </form.Field>

        <form.Field name="current_situations">
          {(field: any) => {
            const rawSituationsValue = field.state.value?.join("\n") || "";
            return (
              <Textarea
                label={
                  <div className="flex items-center gap-1.5">
                    <span>Bối cảnh &amp; tình huống cụ thể</span>
                    <Tooltip
                      label="Mô tả bối cảnh hoặc tình huống thực tế dẫn tới ý tưởng của bạn (ví dụ: khó khăn của khách hàng, vấn đề của thị trường). Hãy nhập mỗi bối cảnh trên một dòng mới."
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
                  const arr = e.target.value.split("\n").filter((line) => line.trim().length > 0);
                  field.handleChange(arr);
                }}
                minRows={3}
                autosize
                radius="md"
              />
            );
          }}
        </form.Field>
      </div>
    </div>
  );
}

