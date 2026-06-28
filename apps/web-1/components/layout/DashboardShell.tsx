"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggler from "../ui/ThemeToggler";
import Logo from "../ui/Logo";
import {
  Avatar,
  Menu,
  Badge,
  Breadcrumbs
} from "@mantine/core";
import { LogOut, LayoutDashboard, Shield } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  // Generate breadcrumbs from pathname
  const pathParts = pathname.split("/").filter((p) => p);
  const breadcrumbsList = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    // Customize label
    let label = part;
    if (part === "dashboard") label = "Dashboard";
    else if (part === "case") label = "Dự án";
    else if (part === "intake") label = "Khởi tạo ý tưởng";
    else if (part === "supporter") label = "Supporter Review";
    else if (part === "admin") label = "Quản trị viên";
    else if (part === "review") label = "Đánh giá";

    return { href, label };
  });

  const user = sessionData?.user ? (sessionData.user as typeof sessionData.user & { role?: string }) : undefined;

  // Role display details
  const getRoleBadge = (role?: string) => {
    if (role === "admin") {
      return (
        <Badge color="red" variant="light" className="font-body text-xs py-1">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </span>
        </Badge>
      );
    }
    if (role === "supporter") {
      return (
        <Badge color="brand" variant="light" className="font-body text-xs py-1">
          Supporter
        </Badge>
      );
    }
    return (
      <Badge color="gray" variant="light" className="font-body text-xs py-1">
        Student
      </Badge>
    );
  };

  const getHomeLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "supporter") return "/supporter";
    return "/dashboard";
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="border-b border-border-app bg-surface-app sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href={getHomeLink()} className="flex items-center">
            <Logo height={52} />
          </Link>
 
          <div className="hidden sm:flex gap-4">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`font-body text-sm font-medium ${
                  pathname.startsWith("/admin") ? "text-brand font-semibold" : "text-text-muted hover:text-brand"
                }`}
              >
                Admin Panel
              </Link>
            )}
            {user?.role === "supporter" && (
              <Link
                href="/supporter"
                className={`font-body text-sm font-medium ${
                  pathname.startsWith("/supporter") ? "text-brand font-semibold" : "text-text-muted hover:text-brand"
                }`}
              >
                Supporter Dashboard
              </Link>
            )}
            {user?.role !== "admin" && user?.role !== "supporter" && (
              <Link
                href="/dashboard"
                className={`font-body text-sm font-medium ${
                  pathname === "/dashboard" ? "text-brand font-semibold" : "text-text-muted hover:text-brand"
                }`}
              >
                Dự án của tôi
              </Link>
            )}
          </div>
        </div>
 
        <div className="flex items-center gap-4">
          <ThemeToggler />
 
          {/* User Menu */}
          {!isPending && user && (
            <div className="flex items-center gap-3">
              {getRoleBadge(user.role)}
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <div className="cursor-pointer">
                    <Avatar
                      src={user.image || undefined}
                      alt={user.name || "User"}
                      radius="xl"
                      className="transition-transform ring-2 ring-transparent hover:ring-brand"
                    >
                      {user.name?.substring(0, 2).toUpperCase() || "US"}
                    </Avatar>
                  </div>
                </Menu.Target>
                <Menu.Dropdown className="bg-surface-app border border-border-app p-1 rounded-lg">
                  <div className="px-3 py-2 border-b border-border-app mb-1">
                    <p className="font-semibold font-body text-sm text-text-app">{user.name || "User"}</p>
                    <p className="font-semibold text-text-muted font-body text-xs truncate">{user.email}</p>
                  </div>
                  <Menu.Item
                    leftSection={<LayoutDashboard className="w-4 h-4 text-text-muted" />}
                    onClick={() => router.push(getHomeLink())}
                    className="text-text-app hover:bg-surface-soft cursor-pointer"
                  >
                    Dashboard
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<LogOut className="w-4 h-4" />}
                    color="red"
                    onClick={handleSignOut}
                    className="hover:bg-danger-soft cursor-pointer"
                  >
                    Đăng xuất
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow w-full flex flex-col min-h-0">
        {children}
      </main>
    </div>
  );
}
