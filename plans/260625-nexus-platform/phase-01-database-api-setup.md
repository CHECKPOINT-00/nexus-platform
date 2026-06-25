# Phase 1: Database & Core API Setup

## Context Links
- [Overview Plan](./plan.md)
- [Workspace Schema](../../prisma/schema.prisma)
- [Scout Report](./scout/scout-01-report.md)

## Overview
- **Priority**: P2
- **Status**: Completed
- **Description**: Khởi tạo cấu trúc các bảng nghiệp vụ trong PostgreSQL và chuẩn bị router Hono backend.
- **Estimated Effort**: 3h

## Key Insights
- Sử dụng `@prisma/adapter-pg` yêu cầu cấu hình đúng connection pool.
- Đảm bảo tất cả các bảng nghiệp vụ tham chiếu `auth_user_id` thay vì tự tạo bảng User mới.
- Thiết lập table mapping dạng `@@map("table_names")` và field dạng snake_case.
- <!-- Updated: Audit Code Review - Cụ thể hoá quan hệ và indexes trong Prisma -->
- Bắt buộc khai báo `@index` cho các khoá ngoại như `case_id`, `checkpoint_id`, `package_id` để tăng tốc truy vấn.

## Requirements
- Database schema phải phản ánh đầy đủ các thực thể: `cases`, `case_members`, `checkpoints`, `lifecycle_units`, `reports`, `payments`, `case_messages`, `case_events`, `ai_jobs`.
- **Thêm model ServicePackage**: Chứa cấu hình động của các gói dịch vụ (price, name, features).
- **Quy tắc kiểu dữ liệu**: Mọi trường liên kết tới Better Auth `users` (ví dụ: `owner_auth_user_id`, `assigned_supporter_auth_user_id`) phải khai báo kiểu `String` khớp với model `User`.
- Hỗ trợ quan hệ (relations) một-nhiều và nhiều-nhiều chính xác.

## Architecture
- **Engine**: Prisma 7 Client.
- **Database**: PostgreSQL với connection pool ổn định.
- **API Engine**: Hono.

## Related Code Files
- [MODIFY] [schema.prisma](../../prisma/schema.prisma) - Thêm các models nghiệp vụ & indexes.
- [NEW] [apps/api/src/routes/cases.ts](../../apps/api/src/routes/cases.ts) - Router cho cases.
- [MODIFY] [apps/api/src/index.ts](../../apps/api/src/index.ts) - Import và mount router cases.

## Implementation Steps
1. Khai báo các model mới cùng model `ServicePackage` và chỉ mục `@index` trong `schema.prisma`.
2. Chạy lệnh migrate: `npm run prisma:migrate` (hoặc `npx prisma migrate dev`).
3. Tạo file router `cases.ts` cơ bản trong backend.
4. Đăng ký router mới vào `index.ts` của Hono.

## Todo List
- [x] Cập nhật file `schema.prisma` kèm model `ServicePackage` và các quan hệ khóa ngoại.
- [x] Thiết lập các index `@index` trên khóa ngoại.
- [x] Thực hiện DB migration.
- [x] Generate Prisma Client.
- [x] Khởi tạo route cases cơ bản.

## Success Criteria
- Lệnh migrate chạy thành công không có lỗi.
- Prisma Client được generate đúng kiểu dữ liệu TS.
- API endpoint `GET /api/cases` trả về mảng rỗng (200 OK).

## Risk Assessment
- *Rủi ro*: Sai lệch kiểu dữ liệu hoặc thiếu foreign key constraints.
- *Khắc phục*: Review schema kỹ lưỡng trước khi chạy migrate.

## Security Considerations
- Sử dụng UUID hoặc nanoid cho ID thay vì auto-increment integer để tránh brute-force enumerate.

## Next Steps
- Tiến hành tích hợp Auth & Layout ở [Phase 2](./phase-02-auth-layout-setup.md).
