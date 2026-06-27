"use client";

import React from "react";
import { Checkbox } from "@mantine/core";
import { AlertTriangle } from "lucide-react";

interface BoundaryStepProps {
  form: any;
  values: any;
}

const BOUNDARY_RULES = [
  { id: "originality", label: "Chúng tôi cam kết tài liệu đính kèm là do nhóm tự nghiên cứu và xây dựng, không sao chép trái phép." },
  { id: "advisory_only", label: "Chúng tôi hiểu rằng các đánh giá và phản biện từ Nexus mang tính chất tư vấn phản biện, không thay thế điểm số của giảng viên." },
  { id: "accurate_contact", label: "Chúng tôi cam kết cung cấp đúng thông tin liên hệ để Supporter trao đổi khi cần làm rõ hồ sơ." }
];

export default function BoundaryStep({ form, values }: BoundaryStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Cam kết ranh giới</h3>
        <p className="font-body text-xs text-text-muted">
          Đọc kỹ và tích chọn tất cả các cam kết dưới đây.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-danger/30 bg-danger-soft/20 text-danger flex gap-3 items-start animate-fade-in">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-danger" />
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-xs text-danger tracking-wide">ĐIỀU KHOẢN QUAN TRỌNG</h4>
          <p className="font-body text-[11px] text-danger/90 leading-relaxed">
            Học viên bắt buộc phải đồng ý với các điều khoản ranh giới để đảm bảo tính minh bạch và quyền lợi chuyên môn. Nexus từ chối hỗ trợ các trường hợp sao chép tài liệu hoặc có kỳ vọng sai lệch về kết quả điểm số chính thức.
          </p>
        </div>
      </div>

      <form.Field
        name="boundary_confirmations"
        validators={{
          onChange: ({ value }: { value: string[] }) => {
            if (!value || value.length < 3) {
              return "Bạn phải tích chọn tất cả cam kết để có thể gửi hồ sơ.";
            }
            return undefined;
          },
        }}
      >
        {(field: any) => {
          const currentConfirmations = field.state.value || [];
          const hasError = !!field.state.meta.errors.length;

          return (
            <div className="space-y-3">
              <div className={`p-4 border rounded-xl space-y-3 transition-all bg-surface-soft/60 ${
                hasError && currentConfirmations.length === 0
                  ? "border-danger shadow-sm" 
                  : "border-border-strong"
              }`}>
                {BOUNDARY_RULES.map((rule) => {
                  const isChecked = currentConfirmations.includes(rule.id);
                  return (
                    <Checkbox
                      key={rule.id}
                      checked={isChecked}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        const next = checked
                          ? [...currentConfirmations, rule.id]
                          : currentConfirmations.filter((id: string) => id !== rule.id);
                        field.handleChange(next);
                      }}
                      label={rule.label}
                      size="xs"
                      radius="sm"
                      className="py-1"
                    />
                  );
                })}
              </div>
              {hasError && (
                <p className="text-[10px] text-danger font-body font-semibold pl-1">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>
    </div>
  );
}
