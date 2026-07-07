# Tóm tắt codebase

_Tổng hợp từ codebase hiện tại và docs canonical trong `docs/`._

## Repo này là gì

Turborepo monorepo cho Nexus Platform, đóng gói workflow `student -> admin -> supporter` quanh `Hồ sơ phản biện`, tài liệu minh chứng, báo cáo phản biện, và các vòng sửa.

## Khu vực chính

### `apps/api`

Backend Hono với:

- `/health`, `/stream`, `/session`
- Better Auth tại `/api/auth/*`
- route cho case, report, payment, package, admin, supporter, document workspace, và AI engine
- ownership cho auth/session, authorization, case workflow, report flow, payment flow, message endpoints, admin/supporter actions

### `apps/web-1`

Next.js 16 product app với các bề mặt:

- public app entry
- auth
- dashboard
- intake flow nhiều bước
- student case workspace
- supporter case workspace
- supporter review page
- admin workspace

### `packages/ui`

Các primitive UI dùng chung giữa các bề mặt.

### `prisma/schema.prisma`

Mô hình dữ liệu Postgres trung tâm cho auth, case, checkpoint, lifecycle unit, document record, document type, report, payment, case event, và AI job.

## Tài liệu chính trong `docs/`

- `docs/project-context.md`
- `docs/project-overview-pdr.md`
- `docs/prd/`
- `docs/flows/`
- `docs/requirements/`
- `docs/technical-notes/`
- `docs/archive/`
- `docs/tech-doc-urls.txt`

## Verified MVP surfaces

- Student case workspace và supporter case workspace cùng bám shared shell, nhưng supporter còn có review page riêng cho báo cáo phản biện.
- `DocumentWorkspace` là bề mặt first-class trong workspace hiện tại, hỗ trợ chọn checkpoint khi case có nhiều checkpoint, hiển thị và phân loại tài liệu dưới dạng các tab `documents` (Tài liệu) và `external-feedback` (Đánh giá bên ngoài). Nó quản lý các tài liệu này thông qua cơ chế tải lên trực tiếp và liên kết bản ghi thông qua bảng `document_records` (phân định rõ người tải lên, nguồn gốc "Tải lên"/"Google Drive"/"Hệ thống" và định dạng).
- `TabDiscussionChat` đã có fetch + send message qua REST và polling 5 giây; thông tin chi tiết của case sử dụng polling 10 giây; không dùng realtime socket.
- `ActivityTimeline` đã được refactor để sử dụng `@mantine/core` Timeline, kết xuất `caseData.events` với các custom bullet và styling.
- `useCaseDetails` polling 10 giây và expose `case`, `intake_snapshot`, `latest_report`, `latest_user_action`, `document_board_sections`, `round_history`, `open_requests_for_more_info`, và `document_workspace`.
- Intake documents là cổng tiếp nhận định hướng hồ sơ/minh chứng trước (profile/evidence-first) thay vì form chung chung, hỗ trợ sinh viên tải trực tiếp tài liệu minh chứng lên hệ thống để lưu trữ trong `document_records`.
- Payment tồn tại như bề mặt phụ trong case workspace qua `payment_status`, unpaid banner, và payment page; không phải golden path của demo. Hệ thống đã bổ sung chức năng cho phép Admin cập nhật giá tiền động của các gói dịch vụ qua tab Settings/Packages mới trong Admin panel, tích hợp cơ chế **Price Locking** (chốt `Case.locked_price` khi tạo) và **Pricing Change Audit Trail** (lưu vết `previous_price`, `last_price_changed_at`, `last_price_changed_by` trên `ServicePackage`). Logic giá và minh chứng thanh toán được tập trung qua các helper `getCaseEffectivePrice`, `formatPrice`, `caseRequiresPayment`, và `validatePaymentProof` trong `@/lib/pricing.ts`.
- **Refund Module**: Module hoàn tiền hoàn chỉnh với database model `Refund` cho phép khách hàng gửi yêu cầu hoàn tiền Tier 1 (100% trước khi gán supporter) trực tiếp từ case workspace, tạo ra sự kiện `refund_requested`. Admin có thể kiểm tra danh sách hoàn tiền, duyệt (`approved`), từ chối (`rejected` kèm lý do tối thiểu 10 ký tự), hoặc hoàn tất chuyển khoản (`completed` yêu cầu nhập mã GD ngân hàng và ảnh hóa đơn upload lên Cloudinary). Trạng thái case được tự động đồng bộ khi hoàn tất (stage: `"closed"`, internal_status: `"cancelled"`, payment_status: `"refunded"`).

## Ràng buộc vận hành

- Chỉ dùng một root `.env`.
- API sở hữu auth và session.
- Runtime DB hiện dùng `DATABASE_URL` và `DIRECT_URL`; ad hoc read-only query script nên dùng `READONLY_DATABASE_URL`.
- Prisma dùng plural table + snake_case columns.
- Web dùng Mantine UI v9 và cấu trúc app router.
- Docs phải bám code hiện tại, ghi rõ cái gì đã code-confirmed và cái gì còn deferred.
