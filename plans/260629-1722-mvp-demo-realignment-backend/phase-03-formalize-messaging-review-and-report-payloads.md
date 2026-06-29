# Phase 03 — Formalize messaging, review, and report payloads

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-01-lock-backend-boundaries-and-demo-contracts.md`
- Depends on: `./phase-02-stabilize-case-lifecycle-admin-triage-and-assignment.md`

## Overview
- Date: 2026-06-29
- Description: Chốt contract cho case messages, supporter review flow, draft/publish report, và structured findings payload.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Frontend chat đã có GET/POST + polling; backend phải đảm bảo persistence semantics và side effects rõ.
- Supporter review page đang dựa vào structured findings; payload shape không được mơ hồ.
- `report.content_md` hiện đang đóng vai trò transport/store cho report payload; cần ghi rõ semantics này.

## Requirements
- Chốt contract list/send messages.
- Chốt event side effects cho messaging nếu có.
- Chốt draft/get/update/publish report flow.
- Chốt structured findings payload shape dùng trong supporter review.
- Chốt quyền ai được tạo/sửa/gửi report ở từng stage.
- Có validation matrix cho message content, report id, report status, payload shape, persisted JSON parse path, role ownership.
- Có edge-case rules cho empty message, over-limit message, repeated publish, stale draft, malformed findings payload, final-stage messaging/report mutate.
- Có error-handling cases cho unauthorized access, not found, invalid report status, parse failure, shape mismatch.

## Architecture
- Persistence-first, contract-driven.
- Nếu `content_md` tiếp tục chứa JSON findings, phải ghi rõ shape và lifecycle.
- Frontend không tự quyết report schema.
- Messaging/reporting contract phải chốt từ HTTP layer tới persisted payload/source-of-truth semantics.

## HTTP contract requirements
- Với list/send message, get/edit/create/publish report, ghi rõ method, path, actor role, request schema, response schema, error statuses.
- Chốt rõ route nào trả `400`, `403`, `404`, `409`, `500`.
- Ghi rõ publish path trả gì khi report không còn `draft`.

## Authorization matrix
- Chốt ai được xem messages, ai được gửi messages, ai được xem draft report, ai được sửa draft, ai được publish.
- Ghi rõ ownership boundary theo case owner, assigned supporter, admin.
- Ghi rõ policy với cross-case report access và cross-role escalation.

## Source-of-truth and backward compatibility
- Chốt `report.content_md` là markdown, structured JSON string, hay hybrid contract.
- Nếu persisted payload cũ khác shape, ghi fallback behavior và parse-failure behavior.
- Ghi non-goal nếu chưa làm migration/backfill trong phase demo.

## Transaction and consistency
- Ghi rõ action nào phải atomic giữa report/message persistence và event/state write.
- Publish report phải chốt consistency giữa report status, case stage/status, event emission.
- Ghi behavior nếu một phần side effect fail giữa transaction chain.

## Concurrency and idempotency
- Chốt policy cho repeated publish, repeated draft create, concurrent draft edit/publish, repeated message resend.
- Ghi rõ return current state, reject `409`, hay overwrite-last-write cho từng path.
- Nếu chưa có optimistic locking/version field, phải ghi risk và fallback expectation.

## Observability and audit
- Log/audit fields tối thiểu: caseId, reportId, actorId, action, old report status, new report status, parse failure, error code.
- Messaging path log size/validation failure nhưng không log raw sensitive content nếu không cần.
- Parse failure và payload mismatch phải có structured diagnostics.

## Test layering
- Unit: trim/max length, payload validation, report status guard, parse fallback.
- Integration: route -> auth -> DB write -> event/state side effects.
- Contract: message/report payload shape frontend reviewer consume.
- Regression: create draft -> edit -> publish, repeated publish, malformed payload, forbidden access.

## Related code files
- `apps/api/src/modules/cases/http/cases.routes.ts`
- `apps/api/src/modules/supporter/http/supporter.routes.ts`
- `apps/api/src/modules/reports/http/reports.routes.ts`
- `apps/api/src/modules/reports/domain/report.types.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `prisma/schema.prisma`

## Implementation Steps
1. Map đầy đủ list/send message contract.
2. Ghi persistence semantics của `CaseMessage` và `CaseEvent` quanh messaging.
3. Ghi flow tạo draft report, lấy draft, update, publish/approve.
4. Ghi structured findings shape canonical.
5. Ghi quyền mutate report theo role và stage.
6. Xác định nếu cần versioning hoặc validation chặt hơn cho payload.
7. Ghi edge cases cho nhắn tin rỗng, nhắn tin vượt giới hạn, nhắn ở case final/closed, publish lặp, stale draft, malformed JSON findings.
8. Lập validation matrix cho content trim/max length, report ownership, `draft` status precondition, payload schema, persisted JSON parsing.
9. Ghi error-handling table cho `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`, `INVALID_REPORT_STATUS`, parse failure, concurrency/race notes khi publish.
10. Lập HTTP contract table cho list/send message và report actions.
11. Lập authorization matrix messaging/reporting theo role + ownership.
12. Chốt source-of-truth contract cho `content_md` và backward-compat fallback.
13. Ghi transaction boundary, concurrency/idempotency, và publish consistency policy.
14. Ghi observability/audit expectations cho message/report/parse failures.
15. Map checklist sang unit/integration/contract/regression tests.

## Todo list
- [ ] Map list/send message contract
- [ ] Ghi message persistence + event semantics
- [ ] Ghi draft/get/update/publish flow
- [ ] Ghi canonical structured findings shape
- [ ] Ghi role/stage permissions cho report actions
- [ ] Ghi validation/versioning needs nếu có
- [ ] Ghi edge cases messaging/reporting
- [ ] Lập validation matrix messaging/reporting
- [ ] Ghi error-handling cases messaging/reporting
- [ ] Lập HTTP contract messaging/reporting
- [ ] Lập authorization matrix messaging/reporting
- [ ] Chốt source-of-truth + backward-compat policy
- [ ] Ghi transaction/consistency policy messaging/reporting
- [ ] Ghi concurrency/idempotency policy messaging/reporting
- [ ] Ghi observability/audit policy messaging/reporting
- [ ] Map test layers messaging/reporting

## Success Criteria
- Chat backend contract đủ rõ để frontend chỉ việc consume.
- Supporter review payload không còn vùng mơ hồ.
- Report publish semantics ổn định cho demo path.
- Failure modes của messaging/reporting được mô tả đủ rõ để tránh frontend/backend tự suy diễn khác nhau.

## Risk Assessment
- Risk cao nếu `content_md` đang bị dùng vừa markdown vừa JSON mà không có contract rõ.
- Risk trung bình nếu event side effects cho messaging/reporting đang thiếu đồng nhất.

## Security Considerations
- Không để user/supporter truy cập nhầm report draft hoặc mutate ngoài quyền.
- Validate content shape trước khi persist/publish.

## Next steps
- Sang phase 04 để khóa packages, attachments, regressions.