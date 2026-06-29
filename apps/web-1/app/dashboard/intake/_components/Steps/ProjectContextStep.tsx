"use client";

import React from "react";
import { TextInput, Textarea, Tooltip } from "@mantine/core";
import { HelpCircle } from "lucide-react";

interface ProjectContextStepProps {
  form: any;
  values: any;
}

export default function ProjectContextStep({ form, values }: ProjectContextStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Thông tin Nhóm / Đề tài</h3>
        <p className="font-body text-xs text-text-muted">
          Thông tin bối cảnh học tập và hoạt động của nhóm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field name="team_context.project_name">
          {(field: any) => (
            <TextInput
              label="Tên đề tài"
              placeholder="Ví dụ: EduMap"
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
              radius="md"
            />
          )}
        </form.Field>

        <form.Field name="team_context.group_no">
          {(field: any) => (
            <TextInput
              label="Số thứ tự nhóm (Group No)"
              placeholder="Ví dụ: Nhóm 5"
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
              radius="md"
            />
          )}
        </form.Field>

        <form.Field name="school">
          {(field: any) => (
            <TextInput
              label="Trường học"
              placeholder="Ví dụ: Đại học FPT"
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
              radius="md"
            />
          )}
        </form.Field>

        <form.Field name="course_context">
          {(field: any) => (
            <TextInput
              label="Mã môn học"
              placeholder="Ví dụ: EXE101"
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
              radius="md"
            />
          )}
        </form.Field>

        <form.Field name="team_context.team_status_summary">
          {(field: any) => (
            <div className="md:col-span-2">
              <Textarea
                label={
                  <div className="flex items-center gap-1.5">
                    <span>Tóm tắt hiện trạng nhóm</span>
                    <Tooltip
                      label="Mô tả ngắn gọn về tình hình hiện tại (ví dụ: đã phân chia công việc xong, đang gặp khó khăn trong thống nhất ý tưởng...)."
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
                placeholder="Ví dụ: Nhóm đã thống nhất ý tưởng, đang viết đề cương phân tích thị trường..."
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                minRows={2}
                autosize
                radius="md"
              />
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
}
