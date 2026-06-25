"use client";

import { useForm } from "@tanstack/react-form";
import { Input, Button, Alert } from "@heroui/react";

interface LoginFormProps {
  loading: boolean;
  error: string;
  onSubmit: (values: { email: string; password: string }) => void;
}

export function LoginForm({ loading, error, onSubmit }: LoginFormProps) {
  const form = useForm({
    defaultValues: {
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
      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-default-700"
            >
              Địa chỉ Email
            </label>
            <Input
              id="login-email"
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
              htmlFor="login-password"
              className="text-sm font-medium text-default-700"
            >
              Mật khẩu
            </label>
            <Input
              id="login-password"
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
        Đăng nhập
      </Button>
    </form>
  );
}
