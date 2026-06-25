"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { signIn, signUp } from "@/lib/auth-client";
import { Input, Label } from "@heroui/react";
import { Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";

export default function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  const handleQuickLogin = async (email: string) => {
    setAuthError(null);
    setIsLoading(true);
    const packageId = searchParams.get("packageId");
    const callbackUrl = packageId 
      ? `/dashboard/intake?packageId=${packageId}`
      : "/dashboard";

    try {
      await signIn.email(
        {
          email,
          password: "Password123",
        },
        {
          onSuccess: () => {
            setIsLoading(false);
            router.push(callbackUrl);
          },
          onError: (ctx) => {
            setIsLoading(false);
            setAuthError(ctx.error.message || "Đăng nhập nhanh không thành công.");
          },
        }
      );
    } catch (err) {
      setIsLoading(false);
      setAuthError("Đã xảy ra lỗi hệ thống khi đăng nhập nhanh.");
    }
  };

  // Read initial tab and package ID from URL search parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [searchParams]);

  // Form handling using TanStack Form
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      setAuthError(null);
      setIsLoading(true);

      const packageId = searchParams.get("packageId");
      // Add packageId to callback URL if present, so intake flow can pick it up
      const callbackUrl = packageId 
        ? `/dashboard/intake?packageId=${packageId}`
        : "/dashboard";

      try {
        if (activeTab === "login") {
          await signIn.email(
            {
              email: value.email,
              password: value.password,
            },
            {
              onSuccess: () => {
                setIsLoading(false);
                router.push(callbackUrl);
              },
              onError: (ctx) => {
                setIsLoading(false);
                setAuthError(ctx.error.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
              },
            }
          );
        } else {
          if (value.password !== value.confirmPassword) {
            setAuthError("Mật khẩu xác nhận không khớp.");
            setIsLoading(false);
            return;
          }

          await signUp.email(
            {
              email: value.email,
              password: value.password,
              name: value.name,
            },
            {
              onSuccess: () => {
                setIsLoading(false);
                router.push(callbackUrl);
              },
              onError: (ctx) => {
                setIsLoading(false);
                setAuthError(ctx.error.message || "Đăng ký không thành công. Email có thể đã tồn tại.");
              },
            }
          );
        }
      } catch (err) {
        setIsLoading(false);
        setAuthError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Tabs Selector */}
      <div className="flex border-b border-border-app">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setAuthError(null);
            form.reset();
          }}
          className={`flex-1 pb-3 text-sm font-semibold font-body border-b-2 transition-colors ${
            activeTab === "login"
              ? "border-brand text-brand"
              : "border-transparent text-text-muted hover:text-text-app"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("register");
            setAuthError(null);
            form.reset();
          }}
          className={`flex-1 pb-3 text-sm font-semibold font-body border-b-2 transition-colors ${
            activeTab === "register"
              ? "border-brand text-brand"
              : "border-transparent text-text-muted hover:text-text-app"
          }`}
        >
          Đăng ký thành viên
        </button>
      </div>

      {/* Global Auth Error Alert */}
      {authError && (
        <div className="flex items-start gap-2 p-3 bg-danger-soft border border-danger/20 text-danger rounded-lg text-xs font-body">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      {/* Form Submission */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {activeTab === "register" && (
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => !value ? "Họ và tên là bắt buộc" : undefined,
            }}
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-text-app font-body">Họ và tên</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                    placeholder="Nguyễn Văn A"
                    className="pl-9 w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand"
                    required
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-danger font-body mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />
        )}

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "Email là bắt buộc";
              if (!/\S+@\S+\.\S+/.test(value)) return "Email không đúng định dạng";
              return undefined;
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-text-app font-body">Địa chỉ Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                  placeholder="name@example.com"
                  className="pl-9 w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand"
                  required
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-danger font-body mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "Mật khẩu là bắt buộc";
              if (value.length < 6) return "Mật khẩu phải chứa ít nhất 6 ký tự";
              return undefined;
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-text-app font-body">Mật khẩu</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                  placeholder="••••••••"
                  className="pl-9 w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand"
                  required
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-danger font-body mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        />

        {activeTab === "register" && (
          <form.Field
            name="confirmPassword"
            validators={{
              onChange: ({ value }) => !value ? "Xác nhận mật khẩu là bắt buộc" : undefined,
            }}
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-text-app font-body">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                    placeholder="••••••••"
                    className="pl-9 w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand"
                    required
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-danger font-body mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 h-10 px-4 mt-6 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg shadow-sm font-body cursor-pointer disabled:opacity-50 transition-colors"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{activeTab === "login" ? "Đăng nhập" : "Đăng ký thành viên"}</span>
        </button>
      </form>

      {/* Quick Login Collapsible */}
      <div className="pt-4 border-t border-border-app">
        <button
          type="button"
          onClick={() => setShowQuickLogin(!showQuickLogin)}
          className="w-full flex items-center justify-between py-2 text-xs font-semibold font-body text-text-muted hover:text-brand transition-colors cursor-pointer"
        >
          <span>Đăng nhập nhanh (Tài khoản Test)</span>
          <span className="text-base leading-none">{showQuickLogin ? "−" : "+"}</span>
        </button>
        
        {showQuickLogin && (
          <div className="mt-3 grid grid-cols-3 gap-2 animate-fade-in">
            <button
              type="button"
              onClick={() => handleQuickLogin("student@example.com")}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border-app bg-surface-soft hover:bg-brand-soft/20 hover:border-brand/30 transition-all cursor-pointer text-center group font-body"
            >
              <span className="font-heading font-bold text-xs text-text-app group-hover:text-brand transition-colors">Student</span>
              <span className="text-[9px] text-text-subtle mt-0.5 break-all">student@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("supporter@example.com")}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border-app bg-surface-soft hover:bg-brand-soft/20 hover:border-brand/30 transition-all cursor-pointer text-center group font-body"
            >
              <span className="font-heading font-bold text-xs text-text-app group-hover:text-brand transition-colors">Supporter</span>
              <span className="text-[9px] text-text-subtle mt-0.5 break-all">supporter@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@example.com")}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border-app bg-surface-soft hover:bg-brand-soft/20 hover:border-brand/30 transition-all cursor-pointer text-center group font-body"
            >
              <span className="font-heading font-bold text-xs text-text-app group-hover:text-brand transition-colors">Admin</span>
              <span className="text-[9px] text-text-subtle mt-0.5 break-all">admin@example.com</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
