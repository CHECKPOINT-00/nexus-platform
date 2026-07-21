# Phase 1: Public Landing & Auth

## Goal
Xây dựng trang chủ (Landing Page) giới thiệu dịch vụ hấp dẫn, phẳng, chuyên nghiệp và trang Xác thực (Auth Page) đáng tin cậy tích hợp Better Auth Client và TanStack Form để quản lý form.

## User Outcome
- Khách truy cập hiểu ngay lập tức Nexus là nền tảng gì, giải quyết vấn đề gì, chi phí ra sao và trả lời được các thắc mắc thường gặp.
- Người dùng đăng nhập/đăng ký tài khoản nhanh chóng, an toàn bằng Email/Password hoặc Google.

## Scope
- Trang chủ `/` hiển thị thông tin giới thiệu dịch vụ, các gói phản biện và FAQ.
- Trang xác thực `/auth` hỗ trợ đăng nhập, đăng ký và tự động chuyển hướng dựa trên trạng thái session.

## Key Files & Directories to Build
- **Landing Page Route**: `apps/web-1/app/page.tsx`
  - Private components: `apps/web-1/app/_components/LandingHero.tsx`, `apps/web-1/app/_components/PackagePreview.tsx`, `apps/web-1/app/_components/FAQSection.tsx`
  - Private hooks: `apps/web-1/app/_hooks/usePackages.ts` (fetch packages using TanStack Query)
- **Auth Page Route**: `apps/web-1/app/auth/page.tsx`
  - Private components: `apps/web-1/app/auth/_components/AuthPanel.tsx` (form Đăng nhập / Đăng ký sử dụng TanStack Form và Better Auth client)

## UX Direction
- **Landing Page**: Giao diện mang cảm giác chuyên nghiệp, có chiều sâu, đáng tin cậy. Tránh các slogan sáo rỗng kiểu marketing cường điệu hay lạm dụng gradient tím/xanh lung linh. Copywriting tiếng Việt thực dụng, đi thẳng vào giá trị cốt lõi: *"Phản biện và tìm lỗi ý tưởng khởi nghiệp theo checkpoint môn học"*.
- **Auth Page**: Thiết kế phẳng tối giản, sạch sẽ. Sử dụng một khung panel phẳng trung tâm thay vì các card có viền quá nổi bật hay đổ bóng quá mạnh.
- **Quy tắc hành động chính**: Mỗi màn hình chỉ có duy nhất một nút bấm Primary nổi bật. Trên Landing Page, đó là nút *"Bắt đầu ngay"* dẫn tới trang Auth. Trên Auth Page, đó là nút *"Đăng nhập"* hoặc *"Đăng ký"*.

## Implementation Steps
1. Xây dựng hook `usePackages.ts` sử dụng TanStack Query để gọi `GET /api/packages` lấy danh sách gói dịch vụ động từ database.
2. Dựng khung Landing page sử dụng các component của Mantine UI trong các file components con của trang chủ (`LandingHero`, `PackagePreview`, `FAQSection`).
3. Phát triển `AuthPanel` sử dụng TanStack Form để quản lý form và validate đầu vào (email hợp lệ, password dài >= 6 ký tự).
4. Tích hợp Better Auth Client để xử lý đăng nhập Email/Password hoặc Google OAuth và thực hiện redirect về `/dashboard` khi có session hợp lệ.
5. Đảm bảo form đăng nhập tuân thủ khả năng tiếp cận (Accessibility), các input luôn có nhãn `<label>` đi kèm chỉ định đúng `id`.

## Acceptance Criteria
- Landing page hiển thị chính xác nội dung thuần Việt, bố cục responsive tốt trên mobile.
- Đăng nhập/đăng ký thành công, lưu trữ session cookie HttpOnly chuẩn xác và chuyển hướng người dùng về dashboard.
- Mọi SVG icon sử dụng từ Lucide React, tuyệt đối không sử dụng emoji trong UI chính thức.
