"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dropdown,
  Avatar,
  Button,
  Breadcrumbs,
} from "@heroui/react";
import { authClient } from "../../lib/auth-client";
import { Sun, Moon, LogOut, LayoutDashboard, Settings } from "lucide-react";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  const activeTheme = theme === "system" ? resolvedTheme : theme;

  // Build breadcrumbs dynamically from pathname
  const getBreadcrumbs = () => {
    if (pathname === "/") return null;
    const paths = pathname.split("/").filter(Boolean);
    
    // Breadcrumbs matching maps
    const nameMap: { [key: string]: string } = {
      dashboard: "Bảng điều khiển",
      intake: "Đăng ký dự án",
      case: "Dự án",
      supporter: "Hàng chờ phản biện",
      admin: "Quản trị hệ thống",
      auth: "Xác thực",
    };

    return (
      <Breadcrumbs className="text-sm font-sans">
        <Breadcrumbs.Item href="/">Trang chủ</Breadcrumbs.Item>
        {paths.map((path, idx) => {
          const isLast = idx === paths.length - 1;
          const href = "/" + paths.slice(0, idx + 1).join("/");
          let displayName = nameMap[path] || path;

          // If path is a UUID, display "Chi tiết"
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(path)) {
            displayName = "Chi tiết dự án";
          }

          return isLast ? (
            <Breadcrumbs.Item key={path}>{displayName}</Breadcrumbs.Item>
          ) : (
            <Breadcrumbs.Item key={path} href={href}>
              {displayName}
            </Breadcrumbs.Item>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-default-200/50 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-orange-600 dark:text-orange-500">
              Nexus
            </span>
          </Link>
          <div className="hidden md:block">
            {mounted && getBreadcrumbs()}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme switcher */}
          {mounted && (
            <Button
              isIconOnly
              variant="ghost"
              aria-label="Đổi giao diện sáng tối"
              onPress={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
            >
              {activeTheme === "dark" ? (
                <Sun className="w-5 h-5 text-orange-400" />
              ) : (
                <Moon className="w-5 h-5 text-default-600" />
              )}
            </Button>
          )}

          {/* User profile / Login CTA */}
          {!isPending && (
            <>
              {session?.user ? (
                <Dropdown className="border border-default-200">
                  <Dropdown.Trigger className="rounded-full cursor-pointer focus:outline-none">
                    <Avatar className="transition-transform w-8 h-8 rounded-full">
                      {session.user.image && <Avatar.Image src={session.user.image} />}
                      <Avatar.Fallback>
                        {session.user.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U"}
                      </Avatar.Fallback>
                    </Avatar>
                  </Dropdown.Trigger>
                  <Dropdown.Popover placement="bottom end">
                    <Dropdown.Menu aria-label="Menu tài khoản">
                      <Dropdown.Item key="profile" className="h-14 gap-2 opacity-100 animate-none" textValue="Profile Info">
                        <p className="font-semibold text-xs text-default-500">Đăng nhập bởi</p>
                        <p className="font-bold text-sm text-default-800">{session.user.name}</p>
                        <p className="text-xs text-default-400 truncate">{session.user.email}</p>
                      </Dropdown.Item>
                      
                      {(session.user as { role?: string }).role === "admin" && (
                        <Dropdown.Item
                          key="admin"
                          onPress={() => router.push("/admin")}
                          textValue="Quản trị hệ thống"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span>Quản trị hệ thống</span>
                          </div>
                        </Dropdown.Item>
                      )}
                      
                      {((session.user as { role?: string }).role === "supporter" || (session.user as { role?: string }).role === "admin") && (
                        <Dropdown.Item
                          key="supporter"
                          onPress={() => router.push("/supporter")}
                          textValue="Hàng chờ phản biện"
                        >
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Hàng chờ phản biện</span>
                          </div>
                        </Dropdown.Item>
                      )}

                      <Dropdown.Item
                        key="dashboard"
                        onPress={() => router.push("/dashboard")}
                        textValue="Bảng điều khiển"
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Bảng điều khiển</span>
                        </div>
                      </Dropdown.Item>

                      <Dropdown.Item
                        key="logout"
                        className="text-danger"
                        onPress={handleSignOut}
                        textValue="Đăng xuất"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </div>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              ) : (
                pathname !== "/auth" && (
                  <Link
                    href="/auth"
                    className="inline-flex items-center justify-center h-10 px-4 font-semibold text-sm border border-default-300 rounded-md text-default-700 bg-background hover:bg-default-50 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )
              )}
            </>
          )}
        </div>
      </div>
      <div className="block md:hidden border-t border-default-100 px-4 py-2 bg-background/50">
        {mounted && getBreadcrumbs()}
      </div>
    </nav>
  );
}
