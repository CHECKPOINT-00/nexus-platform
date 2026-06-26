"use client";

import React from "react";
import { Input, TextArea, Tooltip } from "@heroui/react";
import { HelpCircle } from "lucide-react";

interface ProjectContextStepProps {
  form: any;
  values: any;
}

export default function ProjectContextStep({ form, values }: ProjectContextStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Thông tin Nhóm / Dự án</h3>
        <p className="font-body text-xs text-text-muted">
          Thông tin bối cảnh học tập và hoạt động của nhóm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="team_context.project_name">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-app">Tên dự án / Đề tài</label>
              <Input
                type="text"
                placeholder="Ví dụ: EduMap"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 h-10"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="team_context.group_no">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-app">Số thứ tự nhóm (Group No)</label>
              <Input
                type="text"
                placeholder="Ví dụ: Nhóm 5"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 h-10"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="school">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-app">Trường học</label>
              <Input
                type="text"
                placeholder="Ví dụ: Đại học FPT"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 h-10"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="course_context">
          {(field: any) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-app">Mã môn học</label>
              <Input
                type="text"
                placeholder="Ví dụ: EXE101"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 h-10"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="team_context.team_status_summary">
          {(field: any) => (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-text-app">Tóm tắt hiện trạng nhóm</label>
                <Tooltip delay={0} closeDelay={0}>
                  <Tooltip.Trigger>
                    <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                  </Tooltip.Trigger>
                  <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                    Mô tả ngắn gọn về tình hình hiện tại (ví dụ: đã phân chia công việc xong, đang gặp khó khăn trong thống nhất ý tưởng...).
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <TextArea
                placeholder="Ví dụ: Nhóm đã thống nhất ý tưởng, đang viết đề cương phân tích thị trường..."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 py-2 min-h-20"
              />
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}
