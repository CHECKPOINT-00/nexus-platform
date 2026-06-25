"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggler from "../ui/ThemeToggler";
import {
  Avatar,
  Dropdown,
  Chip,
  Breadcrumbs,
  BreadcrumbsItem
} from "@heroui/react";
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
        <Chip color="danger" variant="soft" className="font-body text-xs">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </span>
        </Chip>
      );
    }
    if (role === "supporter") {
      return (
        <Chip color="accent" variant="soft" className="font-body text-xs text-brand bg-brand-soft">
          Supporter
        </Chip>
      );
    }
    return (
      <Chip color="default" variant="soft" className="font-body text-xs">
        Student
      </Chip>
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
          <Link href={getHomeLink()} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold">N</span>
            <span className="font-heading font-semibold text-lg hidden sm:block text-brand">Nexus</span>
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
              <Dropdown>
                <Dropdown.Trigger className="cursor-pointer">
                  <Avatar className="transition-transform ring-2 ring-transparent hover:ring-brand">
                    {user.image ? (
                      <Avatar.Image src={user.image} alt={user.name || "User"} />
                    ) : null}
                    <Avatar.Fallback>{user.name?.substring(0, 2).toUpperCase() || "US"}</Avatar.Fallback>
                  </Avatar>
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end" className="min-w-[200px] bg-surface-app border border-border-app rounded-lg p-1 shadow-md">
                  <div className="px-3 py-2 border-b border-border-app mb-1">
                    <p className="font-semibold font-body text-sm text-text-app">{user.name || "User"}</p>
                    <p className="font-semibold text-text-muted font-body text-xs truncate">{user.email}</p>
                  </div>
                  <Dropdown.Menu onAction={(key) => {
                    if (key === "logout") {
                      handleSignOut();
                    } else if (key === "dashboard") {
                      router.push(getHomeLink());
                    }
                  }}>
                    <Dropdown.Item id="dashboard" textValue="Dashboard" className="flex items-center gap-2 p-2 text-sm text-text-app hover:bg-surface-soft rounded cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 text-text-muted" />
                      <span>Dashboard</span>
                    </Dropdown.Item>
                    <Dropdown.Item id="logout" textValue="Đăng xuất" className="flex items-center gap-2 p-2 text-sm text-danger hover:bg-danger-soft rounded cursor-pointer">
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {breadcrumbsList.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs>
              <BreadcrumbsItem href={getHomeLink()}>Trang chủ</BreadcrumbsItem>
              {breadcrumbsList.map((crumb, idx) => (
                <BreadcrumbsItem key={idx} href={crumb.href}>
                  {crumb.label}
                </BreadcrumbsItem>
              ))}
            </Breadcrumbs>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
