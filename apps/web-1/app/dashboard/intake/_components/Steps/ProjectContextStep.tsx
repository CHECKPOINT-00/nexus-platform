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
        <h3 className="font-heading text-base font-bold text-text-app">Thông tin Nhóm / Dự án</h3>
        <p className="font-body text-xs text-text-muted">
          Thông tin bối cảnh học tập và hoạt động của nhóm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="team_context.project_name"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length > 100) return "Tên dự án không được vượt quá 100 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextInput
                label="Tên dự án / Đề tài"
                placeholder="Ví dụ: EduMap"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={200}
                radius="md"
              />
            );
          }}
        </form.Field>

        <form.Field
          name="team_context.group_no"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length > 20) return "Số thứ tự nhóm không được vượt quá 20 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextInput
                label="Số thứ tự nhóm (Group No)"
                placeholder="Ví dụ: Nhóm 5"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={50}
                radius="md"
              />
            );
          }}
        </form.Field>

        <form.Field
          name="school"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length > 100) return "Tên trường không được vượt quá 100 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextInput
                label="Trường học"
                placeholder="Ví dụ: Đại học FPT"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={200}
                radius="md"
              />
            );
          }}
        </form.Field>

        <form.Field
          name="course_context"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length > 50) return "Mã môn học không được vượt quá 50 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextInput
                label="Mã môn học"
                placeholder="Ví dụ: EXE101"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                error={hasError ? field.state.meta.errors[0] : undefined}
                maxLength={100}
                radius="md"
              />
            );
          }}
        </form.Field>

        <form.Field
          name="team_context.team_status_summary"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (value && value.length > 500) return "Tóm tắt hiện trạng không được vượt quá 500 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
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
                  error={hasError ? field.state.meta.errors[0] : undefined}
                  maxLength={1000}
                  minRows={2}
                  autosize
                  radius="md"
                />
              </div>
            );
          }}
        </form.Field>
      </div>
    </div>
  );
}
