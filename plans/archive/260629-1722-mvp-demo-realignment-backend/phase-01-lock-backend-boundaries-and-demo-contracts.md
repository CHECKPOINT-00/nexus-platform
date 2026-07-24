# Phase 01 — Lock backend boundaries and demo contracts

## Context links
- Parent plan: `./plan.md`
- Source parent package: `../260629-1722-mvp-demo-realignment/plan.md`
- Docs: `../../docs/system-architecture.md`

## Overview
- Date: 2026-06-29
- Description: Inventory toàn bộ backend touchpoints cho demo path và chốt boundaries/invariants trước khi sửa logic.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Frontend hiện đã có shared shell, chat, timeline; backend plan phải chốt data semantics phía dưới các surface đó.
- Nếu không khóa boundaries trước, frontend sẽ đoán status, report shape, hoặc attachment semantics sai.
- Package này cần chi tiết hơn frontend vì đây là nơi risk nằm ở contract và persistence.

## Requirements
- Liệt kê rõ route nào thuộc demo path.
- Liệt kê DTO/domain/schema fields nào là canonical.
- Ghi rõ trường nào chỉ là reference/metadata, không phải upload pipeline hoàn chỉnh.
- Chốt allowed invariants và ownership giữa cases/admin/supporter/reports/packages.
- Bổ sung validation matrix theo route/usecase/schema cho input, persisted JSON, enum, role, id reference.
- Bổ sung error-handling cases cho malformed payload, missing resource, forbidden action, stale state.
- Bổ sung edge cases cho no-op updates, duplicated actions, partial updates, legacy data shape.

## Architecture
- Backend-contract-first planning.
- Dựa trên routes, domain types, use cases, repositories, Prisma schema.
- Chưa mở rộng workflow mới; chỉ làm rõ workflow hiện có và chỗ cần cứng hóa.
- Boundary phải chốt tới HTTP layer, authorization layer, transaction layer, persistence layer.

## HTTP contract baseline
- Mỗi route demo path phải ghi rõ method, path, auth principal, request schema, response schema, status codes.
- Chuẩn hóa error envelope tối thiểu cho `400`, `403`, `404`, `409`, `500`.
- Map error code domain -> HTTP status để frontend/backend không tự suy diễn khác nhau.

## Authorization matrix baseline
- Ghi rõ quyền của `user`, `supporter`, `admin` theo từng route và từng resource ownership boundary.
- Phân biệt rõ read quyền, mutate quyền, approve/publish quyền.
- Chốt policy cho cross-case access và linked-resource access.

## Transaction and consistency baseline
- Chỉ rõ action nào bắt buộc atomic giữa entity update và event write.
- Chỉ rõ action nào chấp nhận eventual consistency.
- Ghi rollback expectation khi persistence side effect fail.

## Observability baseline
- Ghi structured log/audit fields tối thiểu: `caseId`, `actorId`, `route`, `action`, `oldState`, `newState`, `errorCode`.
- Chỉ rõ path nào phải audit log bắt buộc.
- Không log raw sensitive payload nếu không cần thiết.

## Test layering baseline
- Mỗi phase sau phải map checklist vào unit, integration, contract, regression test layers.
- Contract test phải bám payload frontend đang consume.
- Regression không chỉ happy path; phải có validation/failure/auth paths.

## Related code files
- `apps/api/src/modules/cases/http/cases.routes.ts`
- `apps/api/src/modules/admin/http/admin.routes.ts`
- `apps/api/src/modules/supporter/http/supporter.routes.ts`
- `apps/api/src/modules/reports/http/reports.routes.ts`
- `apps/api/src/modules/packages/http/packages.routes.ts`
- `apps/api/src/modules/cases/domain/case.types.ts`
- `apps/api/src/modules/admin/application/admin.dto.ts`
- `apps/api/src/modules/reports/domain/report.types.ts`
- `prisma/schema.prisma`

## Implementation Steps
1. Inventory tất cả routes tham gia demo path.
2. Ghi rõ request/response contracts nào frontend đang phụ thuộc.
3. Chốt vocabulary canonical cho `user_facing_stage`, `internal_status`, `payment_status`.
4. Chốt ownership của cases, messages, events, reports, packages, payments.
5. Ghi rõ attachment semantics: field nào là file reference, field nào là document reference, field nào là Drive folder ref.
6. Xác định các invariant phải giữ ổn định trong suốt split implementation.
7. Lập validation matrix theo route/controller/schema/usecase/repository boundary.
8. Ghi error taxonomy tối thiểu: `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`, `INVALID_*`, parse failure, unexpected persistence failure.
9. Ghi edge cases cho duplicated command, empty input, malformed persisted JSON, unknown enum, missing linked entity.
10. Lập HTTP contract baseline cho toàn bộ route demo path: method/path/auth/request/response/status/error mapping.
11. Lập authorization matrix baseline theo role + ownership.
12. Xác định transaction boundary, consistency expectation, và audit/log baseline cho các phase sau.
13. Map regression expectations sang unit/integration/contract/regression layers.

## Todo list
- [ ] Liệt kê routes demo path
- [ ] Liệt kê DTO/domain/schema canonical
- [ ] Chốt status vocab canonical
- [ ] Chốt ownership theo module
- [ ] Ghi attachment/reference semantics
- [ ] Ghi invariants cần giữ ổn định
- [ ] Lập validation matrix backend demo path
- [ ] Ghi error-handling cases theo nhóm lỗi
- [ ] Ghi edge cases dữ liệu/command/state
- [ ] Lập HTTP contract baseline
- [ ] Lập authorization matrix baseline
- [ ] Ghi transaction/consistency baseline
- [ ] Ghi observability/audit baseline
- [ ] Map test layers baseline

## Success Criteria
- Backend touchpoints cho demo path được map hết.
- Không còn vùng mơ hồ giữa route, DTO, và Prisma field.
- Frontend implementer có thể đọc package này mà biết rõ backend hứa gì.
- Validation, error, edge-case coverage đủ rõ để implementer không phải tự đoán behavior thất bại.

## Risk Assessment
- Risk trung bình nếu route hiện tại có overlap giữa supporter/reports modules.
- Risk cao nếu attachment semantics bị hiểu sai thành upload manager hoàn chỉnh.

## Security Considerations
- Không nới quyền truy cập role-based routes.
- Không làm lẫn lộn internal/admin-only data với customer-facing payload.

## Next steps
- Sang phase 02 để khóa lifecycle, triage, assignment.