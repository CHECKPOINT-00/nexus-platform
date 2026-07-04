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
      <div className="flex items-center gap-1.5 pb-1">
        <h3 className="font-heading text-base font-bold text-text-app">Phản hồi &amp; Hạn chót</h3>
        <Tooltip
          label="Tối ưu hóa phản hồi từ giảng viên và thời hạn mong muốn của nhóm."
          position="top"
          withArrow
        >
          <span className="flex items-center">
            <HelpCircle className="w-4 h-4 text-text-muted hover:text-text-app cursor-help" />
          </span>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              const hasError = !!field.state.meta.errors.length;
              return (
                 <DateInput
                  label={
                    <div className="flex items-center gap-1.5">
                      <span>Hạn nộp bài mong muốn <span className="text-red-500">*</span></span>
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
                  minDate={dayjs().add(1, "day").toDate()}
                  getDayProps={(date) => {
                    const isToday = dayjs(date).isSame(dayjs(), "day");
                    if (isToday) {
                      return {
                        style: {
                          border: "1.5px solid var(--mantine-color-blue-filled)",
                          fontWeight: "bold",
                        },
                      };
                    }
                    return {};
                  }}
                />
              );
            }}
          </form.Field>

          <form.Field name="urgency">
            {(field: any) => {
              const currentUrgency = field.state.value || "normal";
              return (
                <Radio.Group
                  withAsterisk
                  label="Mức độ ưu tiên xử lý"
                  value={currentUrgency}
                  onChange={(val) => field.handleChange(val)}
                >
                  <div className="flex items-center gap-4 px-3 border border-border-strong rounded-lg bg-surface-soft/60 h-9">
                    <Radio value="normal" label="Bình thường" size="sm" />
                    <Radio value="urgent" label="Gấp (trong 24h)" size="sm" />
                  </div>
                </Radio.Group>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="lecturer_feedback">
          {(field: any) => (
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
