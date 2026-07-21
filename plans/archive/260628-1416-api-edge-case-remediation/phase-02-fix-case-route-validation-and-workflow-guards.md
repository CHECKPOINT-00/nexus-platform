# Context links
- Parent plan: [`plan.md`](./plan.md)
- Depends on: [`phase-01-harden-auth-and-shared-guards.md`](./phase-01-harden-auth-and-shared-guards.md)
- Audit summary: [`reports/audit-summary-report.md`](./reports/audit-summary-report.md)

# Overview
- Date: 2026-06-28
- Description: Vá edge cases trong `cases.routes.ts` gồm create/list/detail/revision/assign/status/messages/settings.
- Priority: P0
- Implementation status: completed
- Review status: completed

# Key Insights
- `cases.routes.ts` là file lớn, chứa nhiều path business-critical.
- Hiện có weak validation, weak transition rules, và thiếu supporter target checks.
- Route này ảnh hưởng trực tiếp dashboard, supporter, admin.

# Requirements
- Xử lý malformed JSON và bad payload nhất quán hơn.
- Validate target supporter tồn tại và đúng role.
- Chặn status/stage invalid transition.
- Chặn message/content/settings payload không hợp lệ.
- Xử lý nonexistent/malformed ids an toàn.

# Architecture
- Ưu tiên helper nhỏ nội bộ hoặc shared validator đơn giản thay vì thêm abstraction lớn.
- Tách guard theo nhóm: payload validation, actor validation, state transition validation.
- Giảm raw string checks lặp lại nếu có thể gom constant/helper.

# Related code files
- Modify:
  - `apps/api/src/modules/cases/presentation/http/cases.routes.ts`
  - `apps/api/src/shared/infrastructure/authorization.ts`
  - `prisma/schema.prisma` only if unique/index rule thật sự cần cho race fix
- Create:
  - none preferred
- Delete:
  - none

# Implementation Steps
1. Rà lại local `getSession` và các route bắt đầu trước `try`.
2. Chuẩn hóa parse-body error handling cho create/revision/settings/status.
3. Siết `validateCp1Intake` và field checks còn thiếu.
4. Thêm supporter existence/role/no-op validation cho assign.
5. Định nghĩa allowed transitions cho `user_facing_stage` và `internal_status` theo logic hiện có.
6. Thêm message length/content guard.
7. Thêm type/length checks cho settings editable fields.
8. Xác nhận route trả code phù hợp cho missing/invalid state/resource.

# Todo list
- [x] Audit all route bodies in `cases.routes.ts`
- [x] Add consistent JSON parse handling
- [x] Tighten intake validation
- [x] Validate assign target supporter
- [x] Add status/stage transition guard
- [x] Add revision payload guard
- [x] Add message size/content guard
- [x] Add settings field validation
- [x] Recheck response semantics

# Success Criteria
- Assign không thể gán user sai role hoặc user không tồn tại.
- Status update không chấp nhận giá trị/transition tùy ý.
- Revision/message/settings routes reject invalid payload sớm.
- Create/detail/supporters routes trả status code rõ ràng và ổn định hơn.

# Risk Assessment
- Transition matrix sai có thể chặn flow hợp lệ hiện tại.
- File lớn dễ phát sinh merge conflict hoặc regression chéo.

# Security Considerations
- Reject malformed payload trước khi chạm DB khi có thể.
- Không lộ raw parser/DB error cho client.
- Bảo đảm member/owner/supporter/admin boundaries không bị nới lỏng.

# Next steps
- Dùng pattern guard tương tự cho supporter/report lifecycle ở Phase 03.
