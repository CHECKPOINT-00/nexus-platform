"use client";

import { useForm } from "@tanstack/react-form";
import { Input, Button, Alert } from "@heroui/react";

interface RegisterFormProps {
  loading: boolean;
  error: string;
  onSubmit: (values: { name: string; email: string; password: string }) => void;
}

export function RegisterForm({ loading, error, onSubmit }: RegisterFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4 mt-4"
    >
      <form.Field name="name">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-name"
              className="text-sm font-medium text-default-700"
            >
              Họ và tên
            </label>
            <Input
              id="register-name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
            />
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-email"
              className="text-sm font-medium text-default-700"
            >
              Địa chỉ Email
            </label>
            <Input
              id="register-email"
              type="email"
              placeholder="email@example.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
            />
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-password"
              className="text-sm font-medium text-default-700"
            >
              Mật khẩu
            </label>
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
            />
          </div>
        )}
      </form.Field>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full font-semibold"
        isPending={loading}
        isDisabled={loading}
      >
        Đăng ký tài khoản
      </Button>
    </form>
  );
}
