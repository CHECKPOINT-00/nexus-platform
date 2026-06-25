# Phase 0: Frontend Foundation

## Goal
Khởi tạo cấu trúc giao diện nền tảng, thiết lập các Provider, Theme (Light/Dark), Fonts, API Client, Auth Client và tạo hệ thống Layout cơ bản (AppShell, AuthShell, DashboardShell) theo kiến trúc thư mục Scalable mới.

## User Outcome
Học viên và các đối tượng sử dụng khác truy cập ứng dụng với tốc độ tải trang nhanh, không bị nhấp nháy màn hình (flash) khi chuyển đổi theme sáng/tối, font chữ hiển thị đồng bộ chuyên nghiệp và các API client được kết nối an toàn.

## Scope
- Cấu hình file `providers.tsx` chứa `HeroUIProvider`, `ThemeProvider` (next-themes) và `QueryClientProvider` (TanStack Query).
- Tích hợp font chữ **Space Grotesk** (cho headings/tiêu đề) và **DM Sans** (cho body/nội dung) qua Google Fonts.
- Thiết lập global styles và design tokens bằng Tailwind CSS v4.
- Cấu hình client kết nối:
  - Better Auth Client (`lib/auth-client.ts`) kết nối với API backend port 8000.
  - Axios/Fetch client (`lib/api-client.ts`) hỗ trợ cookie session credentials.
- Tạo các Layout Shell dùng chung.

## Key Files & Directories to Build
- **Providers Wrapper**: `apps/web-1/app/providers.tsx`
- **Global CSS**: `apps/web-1/app/globals.css` (Tailwind v4 configuration & font imports)
- **API & Auth Client**: 
  - `apps/web-1/lib/api-client.ts`
  - `apps/web-1/lib/auth-client.ts`
- **Layout Shells**:
  - `apps/web-1/components/layout/AppShell.tsx`
  - `apps/web-1/components/layout/AuthShell.tsx`
  - `apps/web-1/components/layout/DashboardShell.tsx` (có Breadcrumbs tự động đồng bộ theo route)
- **Common UI Components**:
  - `apps/web-1/components/ui/ThemeToggler.tsx`
  - `apps/web-1/components/ui/LoadingSkeleton.tsx`

## UX Direction
- Triết lý thiết kế Calm UI: giao diện sạch sẽ, phân cấp thị giác rõ ràng, bình tĩnh và có chiều sâu.
- Tránh sử dụng quá nhiều đường viền (border) đậm hoặc bóng đổ (shadow) mạnh gây rối mắt.
- Chuyển theme mượt mà, hỗ trợ người dùng có xu hướng dùng dark mode ban đêm.

## Implementation Steps
1. Khởi tạo `providers.tsx` tích hợp `HeroUIProvider`, `ThemeProvider` và `QueryClientProvider`.
2. Import font Space Grotesk và DM Sans trong root layout, cấu hình CSS variables và `@theme` cho Tailwind CSS v4.
3. Cấu hình `auth-client.ts` và `api-client.ts` kết nối với API backend port 8000.
4. Xây dựng các Layout Shell dùng chung. DashboardShell cần tích hợp Breadcrumbs hiển thị vị trí hiện tại của user.
5. Xây dựng ThemeToggler và kiểm tra tránh lỗi Hydration của Next.js (bằng cách render ThemeToggler sau khi component mounted ở client).

## Acceptance Criteria
- Ứng dụng chạy dev server không lỗi type hay linter.
- Switch theme sáng/tối hoạt động chuẩn xác, không bị nhấp nháy màn hình khi tải lại trang (no flash).
- Font chữ hiển thị chuẩn xác: Space Grotesk cho headings và DM Sans cho body.
- Gọi API client kết nối thành công đến backend `/health`.
