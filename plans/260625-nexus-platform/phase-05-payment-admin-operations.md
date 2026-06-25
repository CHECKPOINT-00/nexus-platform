# Phase 5: Payment & Admin Operations

## Goal
Xây dựng giao diện hướng dẫn thanh toán thủ công, tải lên minh chứng thanh toán cho học viên và các trang nghiệp vụ quản lý (duyệt thanh toán, phân công supporter) dành cho Admin bằng TanStack Query và TanStack Form.

## User Outcome
- Học viên dễ dàng hoàn tất chuyển khoản ngoài hệ thống và upload ảnh chụp giao dịch thành công.
- Admin duyệt thanh toán nhanh chóng (có nhập lý do từ chối nếu không hợp lệ) và phân công supporter phụ trách case.

## Scope
- Widget thanh toán và form upload minh chứng thanh toán của học viên.
- Màn hình Quản trị Admin `/admin` chứa hai phân hệ chính: Duyệt thanh toán và Phân công Supporter.

## Key Files & Directories to Build
- **Student Payment View**: Tích hợp trong `apps/web-1/app/dashboard/case/[id]/_components/PaymentDrawer.tsx`
- **Admin Console Page**: `apps/web-1/app/admin/page.tsx`
  - Private components:
    - `AdminPaymentVerificationTable.tsx` (Bảng duyệt thanh toán, click ảnh phóng to trong modal)
    - `RejectionReasonModal.tsx` (Hộp thoại yêu cầu Admin nhập lý do khi bấm từ chối giao dịch, sử dụng TanStack Form)
    - `AdminCaseAssignmentTable.tsx` (Bảng gán supporter phụ trách case)
  - Private hooks:
    - `useAdminPayments.ts` (gọi `GET /api/payments` & `POST /api/payments/:id/verify` bằng TanStack Query)
    - `useAdminCases.ts` (gọi `GET /api/cases` & `POST /api/cases/:id/assign` bằng TanStack Query)

## UX Direction
- **Học viên - Upload minh chứng**:
  - Hướng dẫn chuyển khoản rõ ràng kèm mã QR động VietQR.
  - Khu vực chọn file ảnh minh chứng có thanh tiến trình upload (Progress Bar) trực quan.
  - Báo lỗi tại chỗ nếu upload thất bại hoặc file quá nặng (> 5MB).
  - Khi thanh toán bị từ chối, hiển thị banner màu đỏ dịu thông báo lý do cụ thể từ Admin và nút bấm để đăng tải lại minh chứng mới.
- **Admin - Duyệt thanh toán & Phân công**:
  - Giao diện Admin hướng tới sự thực dụng, tập trung hiển thị thông tin rõ ràng và thao tác nhanh chóng. Đồng bộ hóa với design system chung của ứng dụng.
  - **Hành động từ chối có hướng xử lý**: Khi Admin click nút "Reject" (Từ chối), giao diện bắt buộc hiển thị một Modal/Drawer yêu cầu nhập lý do từ chối. Nút xác nhận từ chối chỉ sáng lên (enable) khi lý do nhập vào có độ dài tối thiểu 10 ký tự.

## Implementation Steps
1. Xây dựng hook `useAdminPayments.ts` và `useAdminCases.ts` quản lý state query/mutation cho Admin.
2. Xây dựng widget thanh toán thủ công và panel uploader trên giao diện Case Workspace của sinh viên.
3. Thiết kế bảng duyệt thanh toán cho Admin, hỗ trợ click mở ảnh proof trong Modal.
4. Hiện thực hóa `RejectionReasonModal` sử dụng TanStack Form với điều kiện validate ký tự đầu vào (rejection_reason >= 10 ký tự) để kích hoạt nút gửi.
5. Cập nhật giao diện Workspace của sinh viên hiển thị banner đỏ dịu nếu thanh toán bị từ chối.
6. Thiết lập bảng điều phối case của Admin với dropdown lựa chọn danh sách supporter và gọi API gán supporter.

## Acceptance Criteria
- Học viên upload được file ảnh minh chứng thành công, trạng thái case chuyển sang `pending_verification`.
- Nếu Admin từ chối thanh toán và nhập lý do, học viên thấy ngay banner đỏ chứa lý do đó và tải lên lại được.
- Admin gán supporter thành công, case chuyển sang trạng thái `paid` / `unassigned` và hiển thị trong hàng chờ của supporter được gán.
