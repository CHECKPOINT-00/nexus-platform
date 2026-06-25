import React from "react";
import Link from "next/link";
import ThemeToggler from "../ui/ThemeToggler";

interface AuthShellProps {
  children: React.ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-bg-app transition-colors duration-200">
      {/* Top action bar for theme toggle / back to home */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggler />
      </div>

      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <Link href="/" className="flex items-center gap-2 font-heading font-semibold text-2xl text-brand">
              <span className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-lg">N</span>
              <span>Nexus</span>
            </Link>
            <p className="mt-2 text-center text-sm text-text-muted font-body">
              Nền tảng kiểm định và phản biện dự án khởi nghiệp
            </p>
          </div>

          {/* Form Content */}
          <div className="bg-surface-app py-8 px-4 border border-border-app shadow-sm rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
