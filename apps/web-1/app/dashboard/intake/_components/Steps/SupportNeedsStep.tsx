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
          Làm rõ vấn đề nhóm đang gặp khó khăn và kết quả mong muốn. Thông tin này giúp Supporter chuẩn bị phản biện đúng trọng tâm.
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
                    <span>Kết quả mong đợi sau phản biện</span>
                    <Tooltip
                      label="Mô tả cụ thể kết quả bạn muốn Supporter cung cấp sau khi đọc hồ sơ (ví dụ: chỉ ra các điểm yếu lập luận, câu hỏi phản biện gợi mở và hướng sửa đổi chi tiết)."
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
                placeholder="Ví dụ: Nhận được danh sách điểm yếu trong luận điểm đối thủ cạnh tranh, kèm câu hỏi phản biện gợi mở và hướng sửa đổi cụ thể..."
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

        <form.Field name="support_needs.extra_notes">
          {(field: any) => (
            <Textarea
              label="Ghi chú thêm cho Supporter (Tùy chọn)"
              placeholder="Bất kỳ thông tin bổ sung nào khác giúp Supporter hiểu rõ hơn vấn đề của nhóm."
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
              minRows={2}
              autosize
              radius="md"
            />
          )}
        </form.Field>
      </div>
    </div>
  );
}
