"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";
import type { AuthTab } from "../types";

export function useAuthForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");
    try {
      const { error: signInError } = await authClient.signIn.email(values);
      if (signInError) {
        setError(signInError.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      const { error: signUpError } = await authClient.signUp.email(values);
      if (signUpError) {
        setError(signUpError.message || "Đăng ký thất bại. Vui lòng thử lại.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    }
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setError("");
  };

  return {
    activeTab, switchTab,
    loading, error,
    handleLogin, handleRegister, handleGoogleLogin,
  };
}
