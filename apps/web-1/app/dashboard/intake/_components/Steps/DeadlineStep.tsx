"use client";

import React from "react";
import { TextArea, Checkbox, Tooltip, DatePicker, DateField, Calendar, RadioGroup, Radio } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { HelpCircle } from "lucide-react";

interface DeadlineStepProps {
  form: any;
  values: any;
}

export default function DeadlineStep({ form, values }: DeadlineStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Phản hồi & Hạn chót</h3>
        <p className="font-body text-xs text-text-muted">
          Thông tin phản hồi từ giảng viên và thời hạn mong muốn của nhóm.
        </p>
      </div>

      <div className="space-y-4">
        <form.Field name="lecturer_feedback">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-text-app">Phản hồi của giảng viên hướng dẫn (Tùy chọn)</label>
                <Tooltip delay={0} closeDelay={0}>
                  <Tooltip.Trigger>
                    <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                  </Tooltip.Trigger>
                  <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                    Bao gồm các góp ý trực tiếp từ giảng viên hướng dẫn giúp supporter bám sát để phản biện đúng hướng.
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <TextArea
                placeholder="Ví dụ: Thầy nhận xét phần chân dung khách hàng còn chung chung..."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 py-2 min-h-20"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <form.Field
            name="deadline"
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return undefined;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectedDate = new Date(value);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate <= today) {
                  return "Hạn nộp bài mong muốn phải sau ngày hiện tại.";
                }
                return undefined;
              },
            }}
          >
            {(field: any) => {
              const hasError = !!field.state.meta.errors.length;
              return (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold text-text-app">Hạn nộp bài mong muốn</label>
                    <Tooltip delay={0} closeDelay={0}>
                      <Tooltip.Trigger>
                        <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                      </Tooltip.Trigger>
                      <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                        Ngày nhóm dự định hoàn thành hoặc nộp bài chính thức, giúp Nexus tối ưu hóa thời gian xử lý và phân phối supporter.
                      </Tooltip.Content>
                    </Tooltip>
                  </div>
                  <DatePicker
                    value={field.state.value ? parseDate(field.state.value) : null}
                    onChange={(val) => field.handleChange(val ? val.toString() : "")}
                    isInvalid={hasError}
                    className="w-full"
                  >
                    <DateField.Group className={`w-full bg-surface-soft border rounded-lg h-10 px-3 flex items-center justify-between text-xs text-text-app focus-within:border-brand transition-all ${
                      hasError ? "border-danger text-danger" : "border-border-strong"
                    }`}>
                      <DateField.Input className="flex items-center gap-0.5 w-full">
                        {(segment) => (
                          <DateField.Segment 
                            segment={segment} 
                            className="px-0.5 outline-none focus:bg-brand/10 focus:text-brand rounded font-body text-xs" 
                          />
                        )}
                      </DateField.Input>
                      <DateField.Suffix>
                        <DatePicker.Trigger className="p-1 rounded hover:bg-surface-muted text-text-muted hover:text-text-app cursor-pointer">
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover className="bg-surface-app border border-border-strong rounded-xl shadow-xl p-3 z-50">
                      <Calendar aria-label="Hạn nộp bài mong muốn">
                        <Calendar.Header className="flex items-center justify-between mb-2">
                          <Calendar.YearPickerTrigger className="flex items-center gap-1 text-xs font-semibold text-text-app cursor-pointer">
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                          </Calendar.YearPickerTrigger>
                          <div className="flex gap-1">
                            <Calendar.NavButton slot="previous" className="p-1 rounded hover:bg-surface-soft cursor-pointer" />
                            <Calendar.NavButton slot="next" className="p-1 rounded hover:bg-surface-soft cursor-pointer" />
                          </div>
                        </Calendar.Header>
                        <Calendar.Grid className="w-full border-collapse">
                          <Calendar.GridHeader>
                            {(day) => <Calendar.HeaderCell className="text-xs text-text-muted font-normal p-1">{day}</Calendar.HeaderCell>}
                          </Calendar.GridHeader>
                          <Calendar.GridBody>
                            {(date) => (
                              <Calendar.Cell 
                                date={date} 
                                className="text-xs text-center p-1 rounded-md cursor-pointer hover:bg-surface-soft data-[selected=true]:bg-brand data-[selected=true]:text-white data-[outside-month=true]:text-text-subtle"
                              />
                            )}
                          </Calendar.GridBody>
                        </Calendar.Grid>
                      </Calendar>
                    </DatePicker.Popover>
                  </DatePicker>
                  {hasError && (
                    <p className="text-[10px] text-danger font-body font-semibold pl-1 mt-0.5 animate-fade-in">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="urgency">
            {(field: any) => {
              const currentUrgency = field.state.value || "normal";
              return (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-app">Mức độ ưu tiên xử lý</label>
                  <div className="p-3 border border-border-strong rounded-lg bg-surface-soft/60 flex items-center h-10 w-full">
                    <RadioGroup
                      value={currentUrgency}
                      onChange={(val: string) => field.handleChange(val)}
                      orientation="horizontal"
                      className="w-full flex items-center gap-4"
                    >
                      <Radio value="normal" className="text-xs">
                        <Radio.Content className="flex items-center gap-2">
                          <Radio.Control>
                            <Radio.Indicator />
                          </Radio.Control>
                          <span className="text-xs select-none">Bình thường</span>
                        </Radio.Content>
                      </Radio>
                      <Radio value="urgent" className="text-xs">
                        <Radio.Content className="flex items-center gap-2">
                          <Radio.Control>
                            <Radio.Indicator />
                          </Radio.Control>
                          <span className="text-xs select-none">Gấp (trong 24h)</span>
                        </Radio.Content>
                      </Radio>
                    </RadioGroup>
                  </div>
                </div>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="needs_followup_review">
          {(field: any) => (
            <div className="pt-2">
              <div className="p-4 border border-border-strong rounded-xl bg-surface-soft/60">
                <Checkbox
                  isSelected={!!field.state.value}
                  onChange={(checked: boolean) => field.handleChange(checked)}
                  className="text-xs text-text-app"
                >
                  <Checkbox.Content className="flex items-center gap-2.5">
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span className="text-xs font-body select-none">
                      Đăng ký phản biện thêm 1 vòng phụ sau khi nhận kết quả (nếu gói dịch vụ hỗ trợ)
                    </span>
                  </Checkbox.Content>
                </Checkbox>
              </div>
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}
