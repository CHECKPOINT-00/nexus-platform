# Phase 02 — Stabilize case lifecycle, admin triage, and assignment

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-01-lock-backend-boundaries-and-demo-contracts.md`

## Overview
- Date: 2026-06-29
- Description: Chốt transition rules cho case lifecycle, admin actions, supporter assignment, và event logging liên quan.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Demo path sẽ vỡ nếu stage transitions hoặc assignment rules không rõ.
- Admin triage là chỗ chuyển nghĩa từ “student vừa nộp” sang “ops có thể xử lý”.
- `assignSupporterUseCase` đã có guard cơ bản; phase này phải làm rõ expected behavior toàn tuyến.
- Repeated same-state actions should stay idempotent no-op for demo stability.
<!-- Updated: Validation Session 1 - Idempotent no-op policy confirmed -->

## Requirements
- Có canonical transition rules cho `user_facing_stage` và `internal_status`.
- Có role gates rõ cho admin/supporter/user.
- Có event side effects rõ khi accept/reject/request-more-info/assign/status update.
- Có quy tắc rõ cho assign/unassign supporter.
- Có edge-case rules cho repeated commands, no-op assign, final-stage mutation, partial status update, stale transition request.
- Có validation matrix cho case id, supporter id, role ownership, enum status/stage, allowed transition pair.
- Có error-handling cases cho missing case, invalid supporter, forbidden mutate, invalid transition, conflict/idempotent path.

## Architecture
- Domain + usecase + repository alignment.
- Backend là source of truth cho transition validity.
- Frontend chỉ map/hiển thị, không tự phát minh transition semantics.
- Transition logic phải chốt nhất quán từ HTTP request tới persistence write và audit event.

## HTTP contract requirements
- Với từng action accept/reject/request-more-info/assign/update-status, ghi rõ method, path, actor role, request body/query, success response, error statuses.
- Map rõ `400`, `403`, `404`, `409` cho từng nhóm failure thay vì gom chung.
- Ghi rõ path nào trả no-op/current state thay vì raise error.

## Authorization matrix
- Chốt quyền của `admin`, `supporter`, `user` cho từng action lifecycle.
- Ghi rõ ownership rule: supporter chỉ được mutate case được assign nếu nghiệp vụ yêu cầu.
- Ghi rõ admin override boundary và path nào tuyệt đối không cho user gọi.

## Transaction and consistency
- Accept/reject/request-more-info/assign/status update phải ghi rõ có cần atomic với `CaseEvent` hay không.
- Chốt behavior nếu state update thành công nhưng event write fail.
- Ghi rõ consistency expectation cho timeline/event consumers.

## Concurrency and idempotency
- Ghi rõ policy cho repeated assign, repeated request-more-info, repeated accept/reject, concurrent status update.
- Chốt `no-op return`, `409 conflict`, hay overwrite behavior cho từng path.
- Nếu chưa có optimistic locking, plan phải ghi explicit non-goal và regression risk.

## Observability and audit
- Audit log tối thiểu: actor, case, action, old stage/status, new stage/status, supporter before/after, error code.
- Track rõ event semantics cho assign/unassign/reassign.
- Log riêng invalid transition và forbidden mutate để debug demo failures.

## Test layering
- Unit: enum validation, transition guard, assignment guard, final-stage guard.
- Integration: route -> auth -> DB update -> event write.
- Contract: admin/supporter payload shape frontend dùng.
- Regression: triage -> assign -> request-more-info -> reassign -> final-stage rejection paths.

## Related code files
- `apps/api/src/modules/cases/domain/case.types.ts`
- `apps/api/src/modules/cases/application/assign-supporter.usecase.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/admin/http/admin.routes.ts`
- `apps/api/src/modules/admin/application/admin.dto.ts`
- `prisma/schema.prisma`

## Implementation Steps
1. Audit full set trạng thái hiện có trong domain/schema.
2. Ghi transition table hợp lệ cho demo path.
3. Ghi quy tắc role gate cho từng action admin/supporter.
4. Chốt behavior khi assign supporter lần đầu, reassign, unassign, assign vào final stage.
5. Chốt event types và metadata side effects cho triage/assignment/status actions.
6. Xác định các mismatch hiện có giữa route -> usecase -> repository nếu có.
7. Ghi riêng edge cases: assign cùng supporter, unassign case chưa assign, request-more-info lặp, accept/reject sau final stage, update chỉ 1 field gây state pair lệch.
8. Lập validation matrix cho `caseId`, `supporterId`, stage/status enums, transition pair, assignment ownership.
9. Ghi error-handling table cho `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, `INVALID_CASE_STAGE`, `INVALID_STAGE_TRANSITION`, idempotent/no-op return.
10. Lập HTTP contract table cho accept/reject/request-more-info/assign/update-status.
11. Lập authorization matrix lifecycle theo role + ownership.
12. Ghi transaction boundary và event consistency policy cho từng action.
13. Ghi concurrency/idempotency policy cho repeated command và concurrent write.
14. Ghi observability/audit fields và log expectations.
15. Map checklist sang unit/integration/contract/regression tests.

## Todo list
- [ ] Audit toàn bộ status/stage hiện có
- [ ] Ghi transition table demo path
- [ ] Ghi role gates cho admin/supporter
- [ ] Ghi behavior assign/reassign/unassign
- [ ] Ghi event side effects cần có
- [ ] Xác định mismatch route/usecase/repository
- [ ] Ghi edge cases lifecycle/assignment
- [ ] Lập validation matrix lifecycle/assignment
- [ ] Ghi error-handling cases lifecycle/assignment
- [ ] Lập HTTP contract lifecycle actions
- [ ] Lập authorization matrix lifecycle actions
- [ ] Ghi transaction/consistency policy lifecycle actions
- [ ] Ghi concurrency/idempotency policy lifecycle actions
- [ ] Ghi observability/audit policy lifecycle actions
- [ ] Map test layers lifecycle actions

## Success Criteria
- Demo path có transition semantics rõ và nhất quán.
- Không còn ambiguity ở admin triage và supporter assignment.
- Event log semantics đủ rõ để timeline/frontend không phải đoán.
- Các path thành công, path lỗi, path no-op đều được plan hóa rõ.

## Risk Assessment
- Risk cao nếu nhiều chỗ đang tự set string status thủ công.
- Risk trung bình nếu event metadata đang không nhất quán.

## Security Considerations
- Guard chặt admin-only actions.
- Không cho supporter mutate case ngoài phạm vi được assign nếu nghiệp vụ không cho.

## Next steps
- Sang phase 03 để formalize messages, review, reports.