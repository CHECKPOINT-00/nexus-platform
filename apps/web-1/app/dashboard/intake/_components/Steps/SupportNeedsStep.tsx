"use client";

import React from "react";
import { Select, Textarea, Tooltip } from "@mantine/core";
import { HelpCircle } from "lucide-react";

interface SupportNeedsStepProps {
  form: any;
  values: any;
}

const PRIMARY_NEEDS = [
  { key: "audit_checkpoint_1", label: "Phản biện & Đánh giá rủi ro Checkpoint 1" },
  { key: "validate_customer_problem", label: "Kiểm chứng nỗi đau & Phân khúc khách hàng" },
  { key: "verify_market_size", label: "Đánh giá quy mô thị trường & đối thủ cạnh tranh" },
  { key: "optimize_business_model", label: "Tối ưu mô hình doanh thu & giải pháp thay thế" },
  { key: "general_review", label: "Tổng duyệt toàn diện bản báo cáo Checkpoint" },
];

export default function SupportNeedsStep({ form, values }: SupportNeedsStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Nhu cầu hỗ trợ & Kỳ vọng</h3>
        <p className="font-body text-xs text-text-muted">
          Làm rõ vấn đề nhóm đang gặp khó khăn và kết quả mong muốn.
        </p>
      </div>

      <div className="space-y-4">
        <form.Field
          name="support_needs.primary_need"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return "Nhu cầu hỗ trợ chính là bắt buộc.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <Select
                label="Nhu cầu hỗ trợ chính"
                placeholder="Chọn nhu cầu chính của nhóm bạn"
                data={PRIMARY_NEEDS.map((item) => ({ value: item.key, label: item.label }))}
                value={field.state.value || null}
                onChange={(val) => field.handleChange(val || "")}
                error={hasError ? field.state.meta.errors[0] : undefined}
                radius="md"
                comboboxProps={{ withinPortal: false }}
              />
            );
          }}
        </form.Field>

        <form.Field
          name="expected_outputs"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length < 5) {
                return "Vui lòng mô tả chi tiết kỳ vọng đầu ra (tối thiểu 5 ký tự).";
              }
              if (value && value.length > 1000) {
                return "Kỳ vọng đầu ra không được vượt quá 1000 ký tự.";
              }
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <Textarea
                label={
                  <div className="flex items-center gap-1.5">
                    <span>Kỳ vọng đầu ra</span>
                    <Tooltip
                      label="Chi tiết kết quả nhóm mong muốn đạt được (ví dụ: tìm ra lỗi lập luận đối thủ, nhận hướng sửa đổi để cải thiện bài nộp...)."
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
                placeholder="Ví dụ: Nhận được báo cáo chi tiết chỉ ra các lỗi lập luận logic trong đối thủ cạnh tranh..."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={1001}
                minRows={3}
                autosize
                radius="md"
              />
            );
          }}
        </form.Field>

        <form.Field
          name="support_needs.extra_notes"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length > 1000) return "Ghi chú không được vượt quá 1000 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <Textarea
                label="Ghi chú thêm cho Supporter (Tùy chọn)"
                placeholder="Bất kỳ thông tin bổ sung nào khác giúp Supporter hiểu rõ hơn vấn đề của nhóm."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={1001}
                minRows={2}
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
