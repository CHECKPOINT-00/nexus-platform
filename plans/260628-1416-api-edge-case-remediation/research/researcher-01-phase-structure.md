# Researcher 01 — Phase structure

## Scope
Lập trình tự fix edge cases `apps/api` theo mức rủi ro và phụ thuộc logic.

## Recommended Phases
1. **Chuẩn hóa auth/error nền tảng**
   - Chặn uncaught 500 từ `getSession` / `auth.handler`.
   - Chuẩn hóa 401 vs 403.
2. **Chuẩn hóa guard và validation dùng chung**
   - Gom validate role, id, payload ngắn gọn.
   - Chuẩn hóa response 400/404/409.
3. **Fix case workflows**
   - assign supporter
   - status transition
   - revision submit
   - message size/content
   - settings validation
4. **Fix supporter/report workflows**
   - draft state guard
   - request-more-info idempotency
   - close-case state guard
   - duplicate draft race
5. **Fix admin/payment/package/ai-engine edges**
   - admin 401/403
   - admin query validation
   - payment amount/status rules
   - package/ai-engine bad input handling
6. **Kiểm thử hồi quy**
   - route-level matrix cho auth, role, state transition, malformed payload.

## Dependencies
- Phase 1 chặn blast radius lớn nhất, nên làm trước.
- Phase 2 cần trước khi sửa nhiều route để tránh lặp fix.
- Phase 3 và 4 có thể làm nối tiếp, nhưng cùng dựa trên guard/validation từ phase 2.
- Phase 5 sau cùng vì phụ thuộc auth/error semantics đã ổn định.

## Validation
- Ưu tiên test: auth/session failure, assign/status, draft edit/publish, request-more-info, payment verify.
- Nếu chưa có test harness đầy đủ, ít nhất cần compile + route smoke tests.

## Risks
- `cases.routes.ts` rất lớn, dễ gây regression chéo.
- Logic phân tán giữa `cases`, `supporter`, `reports`, `admin`, `payments`.
- Frontend có thể đang dựa vào semantics lỗi hiện tại.

## Unresolved Questions
- Có muốn gom state transition vào helper chung ngay phase 2, hay fix cục bộ trước?
- Có muốn 404 để che existence resource cho unauthorized user không?
