# Context links
- Parent plan: [`plan.md`](./plan.md)
- Audit summary: [`reports/audit-summary-report.md`](./reports/audit-summary-report.md)
- Research: [`research/researcher-01-phase-structure.md`](./research/researcher-01-phase-structure.md), [`research/researcher-02-file-scope.md`](./research/researcher-02-file-scope.md)
- Docs: `docs/codebase-summary.md`, `docs/code-standards.md`

# Overview
- Date: 2026-06-28
- Description: Cứng hóa session/auth path và shared guard trước khi vá route-level logic.
- Priority: P0
- Implementation status: completed
- Review status: completed

# Key Insights
- Blast radius lớn nhất nằm ở `authorization.ts` và các call site dùng `getSession`.
- Nhiều route đang lẫn giữa 401 và 403.
- Uncaught Better Auth failures có thể làm vỡ mọi protected endpoint.

# Requirements
- Bắt lỗi an toàn quanh `auth.api.getSession(...)` và `auth.handler(...)`.
- Chuẩn hóa semantics unauthenticated vs unauthorized.
- Giữ role checks fail-closed với unknown/missing role.
- Không làm rộng CORS/trusted origins.

# Architecture
- Tạo/điều chỉnh helper chung cho session extraction và safe auth responses.
- Giảm duplicate auth logic giữa middleware, authorization helper, và route-level local helper.
- Chuẩn bị pattern response dùng lại cho các phase sau.

# Related code files
- Modify:
  - `apps/api/src/shared/infrastructure/authorization.ts`
  - `apps/api/src/shared/infrastructure/middlewares/auth.ts`
  - `apps/api/src/index.ts`
  - `apps/api/src/modules/admin/presentation/http/admin.routes.ts`
  - `apps/api/src/modules/cases/presentation/http/cases.routes.ts`
- Create:
  - none preferred; chỉ tạo helper mới nếu thực sự cần.
- Delete:
  - none

# Implementation Steps
1. Rà soát toàn bộ nơi gọi `auth.api.getSession(...)` và `auth.handler(...)`.
2. Chuẩn hóa helper session safe-return hoặc safe-throw policy.
3. Vá `authorization.ts` để phân tách rõ 401/403/404.
4. Vá admin/cases route nào đang collapse `!session` và forbidden thành cùng một code.
5. Đảm bảo unknown role không được bypass bất kỳ guard nào.
6. Chạy compile/test tối thiểu cho auth-protected routes.

# Todo list
- [x] Liệt kê toàn bộ call site auth/session trực tiếp
- [x] Chọn pattern xử lý lỗi auth dùng chung
- [x] Vá `authorization.ts`
- [x] Vá `middlewares/auth.ts`
- [x] Vá `index.ts` auth handler path nếu cần
- [x] Vá admin/cases semantics 401/403
- [x] Verify protected route behavior

# Success Criteria
- Auth/session throw không còn rơi thành uncaught 500 ở protected paths.
- Admin routes và `/supporters` trả đúng 401/403.
- Helper dùng chung có semantics rõ và không cấp quyền cho unknown role.

# Risk Assessment
- Đổi semantics lỗi có thể làm frontend toast/message thay đổi.
- Shared helper sửa sai có blast radius rộng.

# Security Considerations
- Fail closed khi không đọc được session.
- Không leak thêm thông tin qua error body.
- Không nới origin/trustedOrigins.

# Next steps
- Dùng semantics mới để vá state guards ở Phase 02 và 03.
