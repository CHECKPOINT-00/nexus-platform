"use client";

import React from "react";
import { TextField, TextArea, Label, FieldError, Select, ListBox, ListBoxItem, Tooltip } from "@heroui/react";
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
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-text-app">Nhu cầu hỗ trợ chính</Label>
                <Select
                  aria-label="Nhu cầu hỗ trợ chính"
                  placeholder="Chọn nhu cầu chính của nhóm bạn"
                  selectedKey={field.state.value || null}
                  onSelectionChange={(key) => field.handleChange(key?.toString() || "")}
                  className="w-full"
                >
                  <Select.Trigger className={`w-full h-10 px-3 bg-surface-soft border rounded-lg text-xs font-body text-text-app focus:outline-none flex items-center justify-between cursor-pointer transition-all ${
                    hasError ? "border-danger text-danger" : "border-border-strong focus:border-brand"
                  }`}>
                    <Select.Value className="truncate" />
                  </Select.Trigger>
                  <Select.Popover className="bg-surface-app border border-border-strong rounded-xl shadow-xl p-1 min-w-[250px] z-50">
                    <ListBox className="outline-none flex flex-col gap-0">
                      {PRIMARY_NEEDS.map((item) => (
                        <ListBoxItem
                          key={item.key}
                          id={item.key}
                          textValue={item.label}
                          className="px-2.5 py-0.5 text-xs rounded-md hover:bg-surface-soft cursor-pointer text-text-app outline-none select-none block transition-colors"
                        >
                          {item.label}
                        </ListBoxItem>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <FieldError className="text-[10px] text-danger font-body font-semibold pl-1 mt-0.5">
                  {field.state.meta.errors[0]}
                </FieldError>
              </TextField>
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
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold text-text-app">Kỳ vọng đầu ra</Label>
                  <Tooltip delay={0} closeDelay={0}>
                    <Tooltip.Trigger>
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                      Chi tiết kết quả nhóm mong muốn đạt được (ví dụ: tìm ra lỗi lập luận đối thủ, nhận hướng sửa đổi để cải thiện bài nộp...).
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <TextArea
                  placeholder="Ví dụ: Nhận được báo cáo chi tiết chỉ ra các lỗi lập luận logic trong đối thủ cạnh tranh..."
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

        <form.Field name="support_needs.extra_notes">
          {(field: any) => (
            <TextField className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-text-app">Ghi chú thêm cho Supporter (Tùy chọn)</Label>
              <TextArea
                placeholder="Bất kỳ thông tin bổ sung nào khác giúp Supporter hiểu rõ hơn vấn đề của nhóm."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none px-3 py-2 min-h-16"
              />
            </TextField>
          )}
        </form.Field>
      </div>
    </div>
  );
}
