import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  // 1. If not logged in, redirect to auth for protected routes
  if (!sessionCookie) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/supporter") ||
      pathname.startsWith("/admin")
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/supporter/:path*",
    "/admin/:path*",
  ],
};
