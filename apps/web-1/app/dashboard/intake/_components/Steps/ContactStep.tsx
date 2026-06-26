"use client";

import React from "react";
import { TextField, Input, Label, FieldError, Tooltip } from "@heroui/react";
import { HelpCircle } from "lucide-react";

interface ContactStepProps {
  form: any;
  values: any;
}

export default function ContactStep({ form, values }: ContactStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Thông tin người liên hệ</h3>
        <p className="font-body text-xs text-text-muted">
          Thông tin của bạn để Supporter tiện liên hệ hỗ trợ khi cần thiết.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.Field
          name="contact.full_name"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return "Họ và tên là bắt buộc.";
              if (value.trim().length < 2) return "Họ và tên tối thiểu phải 2 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-text-app">Họ và tên</Label>
                <Input
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                  className={`w-full bg-surface-soft border rounded-lg text-xs font-body text-text-app focus:outline-none px-3 h-10 transition-all ${
                    hasError
                      ? "border-danger focus:border-danger ring-1 ring-danger/20 text-danger"
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

        <form.Field
          name="contact.student_code"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return "Mã số sinh viên là bắt buộc.";
              if (value.trim().length < 5) return "Mã số sinh viên tối thiểu phải 5 ký tự.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold text-text-app">Mã số sinh viên</Label>
                  <Tooltip delay={0} closeDelay={0}>
                    <Tooltip.Trigger>
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                      Nhập mã số sinh viên của bạn (ví dụ: HE150123) để xác thực bối cảnh Campus.
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <Input
                  placeholder="Ví dụ: HE150123"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                  className={`w-full bg-surface-soft border rounded-lg text-xs font-body text-text-app focus:outline-none px-3 h-10 transition-all ${
                    hasError
                      ? "border-danger focus:border-danger ring-1 ring-danger/20 text-danger"
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

        <form.Field
          name="contact.team_role"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value || !value.trim()) return "Vai trò trong nhóm là bắt buộc.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold text-text-app">Vai trò trong nhóm</Label>
                  <Tooltip delay={0} closeDelay={0}>
                    <Tooltip.Trigger>
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                      Nhập vai trò của bạn trong nhóm dự án (ví dụ: Trưởng nhóm, Coder, Pitcher, Designer...).
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <Input
                  placeholder="Ví dụ: Leader, Coder, Pitcher..."
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                  className={`w-full bg-surface-soft border rounded-lg text-xs font-body text-text-app focus:outline-none px-3 h-10 transition-all ${
                    hasError
                      ? "border-danger focus:border-danger ring-1 ring-danger/20 text-danger"
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

        <form.Field
          name="contact.zalo"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return "Số điện thoại Zalo là bắt buộc.";
              if (!/^\d{10}$/.test(value.trim())) return "Số điện thoại Zalo phải bao gồm chính xác 10 chữ số.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold text-text-app">Số điện thoại Zalo</Label>
                  <Tooltip delay={0} closeDelay={0}>
                    <Tooltip.Trigger>
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="bg-surface-app border border-border-app p-2 rounded-lg text-xs shadow-md text-text-app max-w-xs leading-relaxed z-50">
                      Cung cấp chính xác SĐT Zalo gồm 10 chữ số để supporter liên hệ nhanh khi cần thiết.
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <Input
                  placeholder="Ví dụ: 0987654321"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                  className={`w-full bg-surface-soft border rounded-lg text-xs font-body text-text-app focus:outline-none px-3 h-10 transition-all ${
                    hasError
                      ? "border-danger focus:border-danger ring-1 ring-danger/20 text-danger"
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

        <form.Field
          name="contact.email"
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return "Email liên hệ là bắt buộc.";
              if (!value.includes("@")) return "Email không đúng định dạng.";
              return undefined;
            },
          }}
        >
          {(field: any) => {
            const hasError = (field.state.meta.isTouched || !!field.state.value) && !!field.state.meta.errors.length;
            return (
              <TextField isInvalid={hasError} className="flex flex-col gap-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-text-app">Email liên hệ</Label>
                <Input
                  type="email"
                  placeholder="Ví dụ: anvhe150123@fpt.edu.vn"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                  className={`w-full bg-surface-soft border rounded-lg text-xs font-body text-text-app focus:outline-none px-3 h-10 transition-all ${
                    hasError
                      ? "border-danger focus:border-danger ring-1 ring-danger/20 text-danger"
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

        <form.Field name="contact.telegram">
          {(field: any) => (
            <TextField className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-text-app">Telegram Username (Tùy chọn)</Label>
              <Input
                placeholder="Ví dụ: @annguyen_fpt"
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none px-3 h-10"
              />
            </TextField>
          )}
        </form.Field>
      </div>
    </div>
  );
}
