import React from "react";
import Link from "next/link";
import ThemeToggler from "../ui/ThemeToggler";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      {/* Public Header */}
      <header className="sticky top-0 z-50 border-b border-border-app bg-surface-app/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-heading font-semibold text-xl text-brand">
            <span className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold">N</span>
            <span>Nexus</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggler />
            <Link
              href="/auth"
              className="inline-flex items-center justify-center font-body text-sm font-medium text-text-muted hover:text-brand px-3 py-1.5 rounded-lg border border-border-app hover:bg-surface-soft transition-colors cursor-pointer"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth?tab=register"
              className="inline-flex items-center justify-center font-body text-sm font-medium bg-brand hover:bg-brand-hover text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border-app bg-surface-app py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-heading font-semibold text-brand">
            <span className="w-6 h-6 rounded-md bg-brand flex items-center justify-center text-white text-xs font-bold">N</span>
            <span>Nexus Platform</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-body text-text-muted">
            <Link href="#" className="hover:text-brand transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="hover:text-brand transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
          <p className="text-text-subtle text-xs font-body">
            &copy; {new Date().getFullYear()} Nexus Platform. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
}
