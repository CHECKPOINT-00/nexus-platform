# Phase 7: Manual Payments

## Context Links
- [Overview Plan](./plan.md)
- [Pricing & Payment Spec Web](../../docs/web-spec/web-spec-pricing-packages.md)
- **Tài liệu tham khảo (References)**:
  - [Web Spec - Pricing & Packages](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/docs/web-spec/web-spec-pricing-packages.md)
  - [Web Spec - Case Lifecycle](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/docs/web-spec/web-spec-case-lifecycle.md)
  - [Design System Master Rules](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/design-system/nexus-platform/MASTER.md)

## Overview
- **Priority**: P2
- **Status**: Pending
- **Description**: Phát triển cổng thanh toán chuyển khoản ngoài hệ thống (Manual Bank Transfer), tải lên minh chứng thanh toán và phê duyệt của Admin.
- **Estimated Effort**: 2h

## Key Insights
- Không tích hợp payment gateway tự động ở MVP. Sử dụng chuyển khoản ngoài hệ thống và upload ảnh proof.
- Khi case ở trạng thái unpaid, giới hạn các tính năng phản biện sâu cho tới khi admin duyệt thanh toán.
- <!-- Updated: Audit Code Review - Cụ thể hóa lưu trữ file proof và lý do từ chối -->
- Minh chứng thanh toán sẽ được lưu trực tiếp trên disk của Hono server và phục vụ tĩnh, tránh phụ thuộc API ngoài.

## Requirements
- Giao diện hiển thị thông tin số tài khoản, mã QR động VietQR (nếu có), số tiền.
- Form cho phép User tải lên file ảnh minh chứng (Proof of payment).
- Màn hình phê duyệt thanh toán cho Admin (Approve/Reject) kèm **lý do từ chối (rejection reason)** bắt buộc nếu bấm Reject (đáp ứng Rule 17).
- **UI/UX Specifications (Compliance)**:
  - **Actionable Rejection (Rule 17)**: Khi Admin click nút "Reject" (Từ chối), giao diện bắt buộc hiển thị một Drawer hoặc Modal yêu cầu nhập lý do. Nút "Xác nhận từ chối" chỉ khả dụng khi lý do có độ dài tối thiểu 10 ký tự.
  - **Payment Status Banner**: Học viên khi bị từ chối sẽ thấy banner đỏ dịu nổi bật trên Workspace kèm lý do cụ thể và CTA phụ để đăng tải lại: *"Minh chứng bị từ chối: [Lý do từ chối]. Vui lòng tải lên ảnh minh chứng mới để tiếp tục"*
  - **File upload UX (Rule 20)**: Hiển thị thanh tiến trình tải lên (upload progress bar) kèm icon file thu nhỏ. Nếu tải lên thành công, hiển thị check xanh; nếu thất bại, hiển thị dòng text xử lý lỗi cụ thể.


## Architecture
- **Payment Lifecycle**: `unpaid` -> `proof_uploaded` -> `pending_verification` -> `paid` / `rejected`.
- **File Storage**: Hono static middleware serving `apps/api/uploads/` directory.

## Related Code Files
- [NEW] [apps/api/src/routes/payments.ts](../../apps/api/src/routes/payments.ts) - API upload proof (multer/form-data) và duyệt thanh toán.
- [MODIFY] [apps/web/app/dashboard/case/[id]/page.tsx](../../apps/web/app/dashboard/case/%5Bid%5D/page.tsx) - Tích hợp widget thanh toán và hiển thị lý do từ chối.
- [MODIFY] [apps/web/app/admin/page.tsx](../../apps/web/app/admin/page.tsx) - Bổ sung danh sách duyệt thanh toán và form input lý do từ chối.

## Implementation Steps
1. Xây dựng component hiển thị thông tin chuyển khoản & QR code.
2. Thiết lập thư mục upload tĩnh `apps/api/uploads/` và đăng ký static middleware trong `index.ts` của Hono.
3. Viết API endpoint `POST /api/payments/proof` để nhận file ảnh upload và lưu link ảnh cục bộ vào bảng `payments`.
4. Viết API endpoint `POST /api/payments/:id/verify` để Admin duyệt (chấp nhận hoặc từ chối kèm text).
5. Cập nhật state của Case sau khi giao dịch chuyển sang `paid` (unlock workflow).

## Todo List
- [ ] Thiết kế Widget hiển thị tài khoản & QR chuyển khoản.
- [ ] Thiết lập folder uploads tĩnh trên backend Hono.
- [ ] Viết API upload ảnh minh chứng thanh toán.
- [ ] Xây dựng màn hình danh sách phê duyệt cho Admin kèm nhập lý do từ chối.
- [ ] Thực hiện logic unlock case sau khi duyệt paid.

## Success Criteria
- Sinh viên gửi được ảnh chuyển khoản.
- Trạng thái case đổi sang `proof_uploaded` / `pending_verification`.
- Admin click duyệt thì case mở khóa tính năng audit.

## Risk Assessment
- *Rủi ro*: Sinh viên tải lên file độc hại hoặc giả mạo.
- *Khắc phục*: Validate định dạng file ảnh (chỉ cho phép `.jpg`, `.jpeg`, `.png`, `.pdf`) và giới hạn dung lượng file tối đa (e.g. 5MB).

## Security Considerations
- Chỉ có Admin mới được gọi API duyệt thanh toán (`/verify`).

## Next Steps
- Triển khai E2E Verification & Launch ở [Phase 8](./phase-08-e2e-verification.md).
