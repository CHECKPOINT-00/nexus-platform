"use client";

import { Card, Tabs } from "@heroui/react";
import { useAuthForm } from "./hooks/use-auth-form";
import { LoginForm } from "./_components/login-form";
import { RegisterForm } from "./_components/register-form";
import { GoogleLoginBtn } from "./_components/google-login-btn";

export default function AuthPage() {
  const form = useAuthForm();

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border border-default-200/50 shadow-sm rounded-md">
        <Card.Header className="flex flex-col items-center gap-1 pb-2 pt-6">
          <h1 className="text-2xl font-bold tracking-tight font-display">Nexus</h1>
          <p className="text-sm text-default-500">Phản biện và tối ưu hóa ý tưởng khởi nghiệp</p>
        </Card.Header>

        <Card.Content className="px-6 py-4">
          <Tabs
            selectedKey={form.activeTab}
            onSelectionChange={(key) => form.switchTab(key as "login" | "register")}
            variant="secondary"
            className="w-full"
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Xác thực tài khoản" className="border-b border-default-200 w-full flex">
                <Tabs.Tab id="login" className="flex-1 text-center py-2">
                  Đăng nhập
                  <Tabs.Indicator className="bg-orange-500" />
                </Tabs.Tab>
                <Tabs.Tab id="register" className="flex-1 text-center py-2">
                  Đăng ký
                  <Tabs.Indicator className="bg-orange-500" />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="login">
              <LoginForm
                loading={form.loading}
                error={form.error}
                onSubmit={form.handleLogin}
              />
            </Tabs.Panel>

            <Tabs.Panel id="register">
              <RegisterForm
                loading={form.loading}
                error={form.error}
                onSubmit={form.handleRegister}
              />
            </Tabs.Panel>
          </Tabs>

          <GoogleLoginBtn onClick={form.handleGoogleLogin} />
        </Card.Content>
      </Card>
    </div>
  );
}
