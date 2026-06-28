"use client";

import React from "react";
import { Textarea, Checkbox, Tooltip, Radio } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { HelpCircle } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface DeadlineStepProps {
  form: any;
  values: any;
}

// Helper to parse date string in local time to avoid timezone shifts
const parseLocalDate = (val: any) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const parsed = dayjs(val);
  return parsed.isValid() ? parsed.toDate() : null;
};

// Parser to convert manually typed DD/MM/YYYY string to YYYY-MM-DD
const dateParser = (input: string) => {
  if (!input) return null;
  const parsed = dayjs(input, "DD/MM/YYYY", true);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
};

export default function DeadlineStep({ form, values }: DeadlineStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Phản hồi &amp; Hạn chót</h3>
        <p className="font-body text-xs text-text-muted">
          Tối ưu hóa phản hồi từ giảng viên và thời hạn mong muốn của nhóm.
        </p>
      </div>

      <div className="space-y-4">
        <form.Field
          name="lecturer_feedback"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length > 1000) return "Phản hồi giảng viên không được vượt quá 1000 ký tự.";
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
                    <span>Phản hồi của giảng viên hướng dẫn (Tùy chọn)</span>
                    <Tooltip
                      label="Bao gồm các góp ý trực tiếp từ giảng viên hướng dẫn giúp supporter bám sát để phản biện đúng hướng."
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
                placeholder="Ví dụ: Thầy nhận xét phần chân dung khách hàng còn chung chung..."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={1000}
                minRows={2}
                autosize
                radius="md"
              />
            );
          }}
        </form.Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <form.Field
            name="deadline"
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return undefined;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectedDate = parseLocalDate(value);
                if (selectedDate) {
                  selectedDate.setHours(0, 0, 0, 0);
                  if (selectedDate <= today) {
                    return "Hạn nộp bài mong muốn phải sau ngày hiện tại.";
                  }
                }
                return undefined;
              },
            }}
          >
            {(field: any) => {
              const hasError = field.state.meta.isTouched && !!field.state.meta.errors.length;
              return (
                <DateInput
                  label={
                    <div className="flex items-center gap-1.5">
                      <span>Hạn nộp bài mong muốn</span>
                      <Tooltip
                        label="Ngày nhóm dự định hoàn thành hoặc nộp bài chính thức, giúp Nexus tối ưu hóa thời gian xử lý và phân phối supporter."
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
                  placeholder="dd/MM/yyyy"
                  valueFormat="DD/MM/YYYY"
                  dateParser={dateParser}
                  value={field.state.value || null}
                  onChange={(val) => {
                    field.handleChange(val || "");
                  }}
                  error={hasError ? field.state.meta.errors[0] : undefined}
                  radius="md"
                  clearable
                />
              );
            }}
          </form.Field>

          <form.Field name="urgency">
            {(field: any) => {
              const currentUrgency = field.state.value || "normal";
              return (
                <Radio.Group
                  label="Mức độ ưu tiên xử lý"
                  value={currentUrgency}
                  onChange={(val) => field.handleChange(val)}
                >
                  <div className="flex items-center gap-4 mt-2 p-3 border border-border-strong rounded-lg bg-surface-soft/60 h-10">
                    <Radio value="normal" label="Bình thường" size="xs" />
                    <Radio value="urgent" label="Gấp (trong 24h)" size="xs" />
                  </div>
                </Radio.Group>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="needs_followup_review">
          {(field: any) => (
            <div className="pt-2">
              <div className="p-4 border border-border-strong rounded-xl bg-surface-soft/60">
                <Checkbox
                  checked={!!field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.checked)}
                  label="Đăng ký phản biện thêm 1 vòng phụ sau khi nhận kết quả (nếu gói dịch vụ hỗ trợ)"
                  size="xs"
                />
              </div>
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}
