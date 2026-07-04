# Context links
- Parent plan: [`plan.md`](./plan.md)
- Depends on: [`phase-01-harden-auth-and-shared-guards.md`](./phase-01-harden-auth-and-shared-guards.md), [`phase-02-fix-case-route-validation-and-workflow-guards.md`](./phase-02-fix-case-route-validation-and-workflow-guards.md)
- Audit summary: [`reports/audit-summary-report.md`](./reports/audit-summary-report.md)

# Overview
- Date: 2026-06-28
- Description: Vá lifecycle bugs trong draft report, publish flow, request-more-info, close-case, report access.
- Priority: P0
- Implementation status: completed
- Review status: completed

# Key Insights
- `supporter.routes.ts` và `reports.routes.ts` có logic gần nhau, dễ drift.
- Draft flows hiện thiếu state guard và race protection.
- Request-more-info / close-case thiếu state/idempotency checks.

# Requirements
- Draft generation phải xử lý missing/malformed intake và service failure an toàn.
- Draft edit/publish chỉ cho phép đúng report state.
- Request-more-info và close-case phải check current state/idempotency.
- Report/case access helper phải rõ chính sách existence leak.

# Architecture
- Giữ cả `reports.routes.ts` và `supporter.routes.ts`, nhưng bắt buộc dùng cùng một rule set cho report draft lifecycle. <!-- Updated: Validation Session 1 - keep both route families with shared rules -->
- Nếu helper nhỏ dùng lại được, ưu tiên trích xuất hơn là giữ 2 logic gần giống.
- Cân nhắc transaction hoặc unique rule nếu duplicate draft race là thực tế cao.
- Unauthorized existing report/case giữ semantics 403, không masking 404. <!-- Updated: Validation Session 1 - keep 403 semantics -->

# Related code files
- Modify:
  - `apps/api/src/modules/supporter/presentation/http/supporter.routes.ts`
  - `apps/api/src/modules/reports/presentation/http/reports.routes.ts`
  - `apps/api/src/services/ai.ts`
  - `apps/api/src/shared/infrastructure/authorization.ts`
  - `prisma/schema.prisma` if race fix cần unique constraint/index
- Create:
  - none preferred
- Delete:
  - none

# Implementation Steps
1. So sánh create/get/edit/publish draft giữa `supporter` và `reports` routes.
2. Chốt canonical draft-state rules: allowed statuses, required content, actor permissions.
3. Thêm guard trước update/publish.
4. Chuẩn hóa intake lookup + malformed JSON handling + AI failure response.
5. Thêm state/idempotency guard cho request-more-info.
6. Thêm state/idempotency guard cho close-case.
7. Chốt policy cho unauthorized existing report/case: 403 hay 404 masking.
8. Verify round-trip với case detail/review flows.

# Todo list
- [x] Diff rule sets giữa `supporter.routes.ts` và `reports.routes.ts`
- [x] Define draft lifecycle rules
- [x] Add draft edit/publish guards
- [x] Add duplicate draft mitigation
- [x] Add request-more-info state/idempotency guard
- [x] Add close-case state/idempotency guard
- [x] Review existence leak policy
- [x] Verify UI-facing response compatibility

# Success Criteria
- Không thể edit/publish report sai state.
- Duplicate draft creation được giảm/chặn rõ hơn.
- Request-more-info và close-case không replay bừa trên state không hợp lệ.
- AI/intake errors trả response an toàn hơn.

# Risk Assessment
- Nếu 2 router giữ logic khác nhau, fix lệch rất dễ quay lại.
- State guard mới có thể lộ coupling với frontend review flow.

# Security Considerations
- Không lộ chi tiết lỗi AI/service quá mức.
- Giữ access boundaries chặt cho supporter/admin/student.
- Xem xét masking resource existence nếu phù hợp policy.

# Next steps
- Sau lifecycle ổn định, vá admin/payment/package/ai-engine edges ở Phase 04.
