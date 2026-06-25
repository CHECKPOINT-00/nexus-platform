# Phase 2: Auth & Layout Setup

## Context Links
- [Overview Plan](./plan.md)
- [Better Auth Config Backend](../../apps/api/src/auth.ts)
- [Frontend Providers](../../apps/web/app/providers.tsx)

## Overview
- **Priority**: P2
- **Status**: Pending
- **Description**: Thiết lập Better Auth client trên Next.js và dựng Layout/Navigation chuẩn cho workspace.
- **Estimated Effort**: 2h

## Key Insights
- Cần bật credentials và CORS chuẩn trong Hono để cookie session được truyền đi.
- HeroUI v3 sử dụng next-themes cho dark mode, cần tích hợp đồng nhất ở layout.
- <!-- Updated: Validation Session 1 - Áp dụng font chữ Space Grotesk & DM Sans và triết lý thiết kế Calm UI -->
- Sử dụng font **Space Grotesk** cho headings và **DM Sans** cho body để giao diện chuyên nghiệp, rõ ràng.

## Requirements
- Người dùng có thể đăng nhập/đăng ký bằng Email/Password hoặc Google. Giao diện cực tối giản, tránh hiệu ứng gây phân tâm.
- Layout chính hiển thị Navbar động: Ẩn/Hiện nút Login dựa trên session.
- Theme toggler hoạt động mượt mà.
- **Breadcrumbs Navigation**: Sử dụng HeroUI Breadcrumbs hiển thị cấu trúc trang giúp người dùng luôn trả lời được câu hỏi "Tôi đang ở đâu?" (Rule 2).

## Architecture
- **Auth Client**: Better Auth Web Client.
- **Theme**: next-themes + HeroUI v3 (Flat Design, HSL colors).
- **Fonts**: Space Grotesk & DM Sans.

## Related Code Files
- [NEW] [apps/web/lib/auth-client.ts](../../apps/web/lib/auth-client.ts) - Cấu hình Better Auth client.
- [NEW] [apps/web/app/auth/page.tsx](../../apps/web/app/auth/page.tsx) - Trang login/register.
- [MODIFY] [apps/web/app/layout.tsx](../../apps/web/app/layout.tsx) - Tích hợp providers, fonts và layout chung.
- [MODIFY] [apps/web/app/providers.tsx](../../apps/web/app/providers.tsx) - Tích hợp HeroUIProvider và ThemeProvider.

## Implementation Steps
1. Cài đặt better-auth client-side npm package nếu chưa có.
2. Tạo file cấu hình `auth-client.ts` chỉ tới backend port 8000.
3. Xây dựng Form login sử dụng HeroUI components (`Input`, `Button`, `Card`).
4. Tải font Space Grotesk và DM Sans về Next.js layout.
5. Dựng Header/Navbar dùng chung cho toàn bộ site tích hợp Breadcrumbs.

## Todo List
- [ ] Setup Better Auth Client.
- [ ] Tích hợp Font chữ Space Grotesk và DM Sans.
- [ ] Dựng trang Đăng nhập & Đăng ký tối giản.
- [ ] Tạo Header/Navbar với menu Avatar người dùng và Breadcrumbs.
- [ ] Tích hợp bảo vệ route dựa trên session.

## Success Criteria
- Đăng nhập/Đăng ký thành công lưu cookie session.
- Session đồng bộ chính xác về Hono.
- Switch theme sáng/tối không bị flash trắng màn hình.

## Risk Assessment
- *Rủi ro*: CORS block cookie session.
- *Khắc phục*: Đảm bảo CORS credentials = true trên cả API và Web client request.

## Security Considerations
- Lưu token session qua cookies HttpOnly chống XSS.

## Next Steps
- Phát triển trang Landing & Service Packages ở [Phase 3](./phase-03-landing-packages.md).
