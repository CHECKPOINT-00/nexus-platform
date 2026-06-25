# Phase 6: Frontend QA & Polish

## Goal
Thực hiện kiểm thử chất lượng giao diện (Frontend QA), tinh chỉnh thẩm mỹ (Polish), bảo vệ định tuyến (Route Guard Middleware), xử lý các trạng thái tải trang (Loading), lỗi (Error) và đảm bảo tính nhất quán visual trên toàn bộ ứng dụng.

## User Outcome
- Trải nghiệm sử dụng mượt mà, không gặp lỗi giao diện vỡ hay trang trống không phản hồi.
- Điều hướng mượt mà, phân quyền hiển thị (role-based) hoạt động chính xác giữa các tài khoản Học viên, Supporter và Admin.

## Scope
- Triển khai Middleware (`middleware.ts`) chặn học viên truy cập trái phép vào `/admin` hoặc `/supporter` và chuyển hướng họ về `/dashboard`.
- Kiểm tra tính tương thích Responsive (Mobile, Tablet, Desktop) cho toàn bộ các màn hình chính.
- Triển khai Loading Skeletons, Error Boundaries và các trang báo lỗi tùy chỉnh (404, 500) thuần Việt.
- Tối ưu hóa hiệu năng render giao diện client-side.

## Key Files & Directories to Build
- **Route Guard Middleware**: `apps/web-1/middleware.ts`
- **Common Loading Skeletons**: `apps/web-1/components/ui/LoadingSkeleton.tsx`
- **Root Error Templates**:
  - `apps/web-1/app/not-found.tsx` (Trang lỗi 404 tùy chỉnh)
  - `apps/web-1/app/error.tsx` (Trang lỗi 500 / Error Boundary toàn cục)

## UX Direction
- **Không có khoảng trống vô nghĩa**: Mọi trạng thái dữ liệu rỗng (Empty state), đang tải (Loading), hay gặp lỗi (Error) đều phải hiển thị thông tin rõ ràng kèm nút hành động định hướng (Ví dụ: *"Đã xảy ra lỗi tải báo cáo. Bấm Thử lại"*).
- **Responsive mượt mà**: Giao diện 3 cột của Case Workspace trên máy tính phải tự động chuyển thành cấu trúc 3 Tabs ngang trên thiết bị di động để người dùng dễ thao tác bằng một tay mà không bị tràn khung hình.
- **Tính nhất quán**: Đảm bảo toàn bộ font chữ, màu sắc semantic, border, spacing và hover transition tuân thủ chặt chẽ design direction đã đề ra.

## Implementation Steps
1. Xây dựng Next.js `middleware.ts` sử dụng Better Auth Session check để thực hiện định tuyến và phân quyền.
2. Thực hiện rà soát responsive trên các trình giả lập thiết bị (Mobile/Tablet).
3. Tích hợp `LoadingSkeleton` cho Dashboard và Case Workspace khi đang tải dữ liệu từ React Query.
4. Thiết lập các Error Boundary (`error.tsx`) bao bọc các vùng chức năng quan trọng để bảo vệ app khỏi crash trắng màn hình.

## Acceptance Criteria
- 100% trang web hiển thị responsive chuẩn xác, không bị lỗi tràn ngang (horizontal scroll) trên màn hình di động.
- Trạng thái loading hiển thị skeleton mượt mà, không giật lag.
- Việc truy cập trang không có quyền (ví dụ student vào `/admin`) tự động chuyển hướng về `/dashboard` một cách an toàn.
