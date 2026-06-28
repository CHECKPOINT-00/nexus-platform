# Context links
- Parent plan: [`plan.md`](./plan.md)
- Depends on: [`phase-01-harden-auth-and-shared-guards.md`](./phase-01-harden-auth-and-shared-guards.md)
- Audit summary: [`reports/audit-summary-report.md`](./reports/audit-summary-report.md)

# Overview
- Date: 2026-06-28
- Description: Vá edge cases còn lại trong admin, payments, packages, và ai-engine.
- Priority: P1
- Implementation status: completed
- Review status: completed

# Key Insights
- Admin flows đang có 401/403 semantics chưa chuẩn và query parsing yếu.
- Payments có nguy cơ write amount `0` và drift payment status.
- Packages/ai-engine cần recheck bad input và upstream failure paths.

# Requirements
- Admin-only routes phải phân biệt đúng no-session và forbidden.
- Query params phải được validate trước khi qua Prisma.
- Payment creation/verification phải chặn invalid states và stale relation issues.
- Canonical payment status dùng `paid`; mọi normalization/transition follow theo hướng này. <!-- Updated: Validation Session 1 - paid is canonical status -->
- Package/AI-engine routes phải fail an toàn với input lỗi.

# Architecture
- Tái dùng shared auth/error helpers từ Phase 01.
- Tái dùng payload/state validation patterns đã áp dụng ở Phase 02/03.
- Tránh thêm abstraction lớn nếu chỉ cần 1-2 helper nhỏ.

# Related code files
- Modify:
  - `apps/api/src/modules/admin/presentation/http/admin.routes.ts`
  - `apps/api/src/modules/payments/presentation/http/payments.routes.ts`
  - `apps/api/src/modules/packages/presentation/http/packages.routes.ts`
  - `apps/api/src/modules/ai-engine/presentation/http/ai-engine.routes.ts`
  - `apps/api/src/shared/infrastructure/authorization.ts`
- Create:
  - none preferred
- Delete:
  - none

# Implementation Steps
1. Vá admin session helper để trả đúng 401/403.
2. Validate `limit`, `page`, ids, và các query params khác trước khi truy vấn.
3. Với payments, xác nhận package relation hợp lệ trước khi tính amount.
4. Chốt canonical payment status mapping và verify/reject transition rules.
5. Chặn replay verify/reject trên payment đã final.
6. Kiểm tra package routes với empty data/bad ids.
7. Kiểm tra ai-engine malformed input và upstream/service error path.

# Todo list
- [x] Fix admin auth semantics
- [x] Validate admin query params
- [x] Validate payment package relation
- [x] Normalize payment status mapping
- [x] Add payment transition guards
- [x] Recheck package bad-id behavior
- [x] Recheck ai-engine failure handling

# Success Criteria
- Admin routes không còn collapse no-session thành forbidden.
- Query param lỗi không làm Prisma nhận `NaN`.
- Payment không thể tạo amount `0` do stale relation.
- Verify/reject payment obey state rules.

# Risk Assessment
- Payment status đổi semantics có thể ảnh hưởng UI/admin hooks.
- AI-engine path có thể phụ thuộc service contract bên ngoài.

# Security Considerations
- Admin endpoints phải fail closed.
- Không leak stack/raw provider errors.
- Validate identifiers trước DB lookups khi hợp lý.

# Next steps
- Sau khi vá xong, thêm regression checks và doc updates ở Phase 05.
