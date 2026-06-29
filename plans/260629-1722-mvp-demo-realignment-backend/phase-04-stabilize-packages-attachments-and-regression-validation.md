# Phase 04 — Stabilize packages, attachments, and regression validation

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-01-lock-backend-boundaries-and-demo-contracts.md`
- Depends on: `./phase-03-formalize-messaging-review-and-report-payloads.md`

## Overview
- Date: 2026-06-29
- Description: Chốt package catalog behavior, attachment/reference semantics, và regression checks cho demo-critical backend path.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Package list là business contract backend-owned.
- Attachment logic hiện đọc giống metadata/reference storage hơn upload platform hoàn chỉnh.
- Nếu không khóa rõ semantics này, frontend và future backend work sẽ hiểu lệch nhau.

## Requirements
- Chốt package list + default seed behavior.
- Chốt semantics cho `drive_folder_id`, `file_url`, `document_id`, payment proof refs, report refs.
- Xác định backend đang support reference-only hay cần upload endpoint thật.
- Có regression checklist cho demo-critical flows.
- Có validation matrix cho package response fallback, attachment/reference field shape, payment proof refs, persisted relation ids.
- Có edge-case rules cho DB rỗng, legacy attachment shape, missing file refs, malformed URL/ref, mixed `drive_url`/`file_url` inputs.
- Có error-handling cases cho missing package, storage/upload fail boundary, invalid refs, leaked internal refs.

## Architecture
- Business-contract + persistence semantics.
- Tách rõ package contract khỏi frontend rendering.
- Tách rõ attachment references khỏi upload UX assumptions.
- Phase này phải chốt exposure policy và validation policy từ HTTP response tới stored refs.

## HTTP contract requirements
- Với package list và các payload có attachment/reference fields, ghi rõ response schema, nullable fields, fallback behavior, error statuses.
- Chốt rõ package endpoint trả gì khi DB rỗng, seed fallback active, hay unexpected repo failure.
- Ghi rõ attachment/reference field nào public, field nào internal-only, field nào chỉ metadata.

## Authorization and exposure policy
- Chốt ai được thấy package data, ai được thấy attachment refs, ai được thấy document/payment/report refs.
- Ghi rõ internal ref nào không được expose ra frontend/public payload.
- Ghi rõ linked-resource access rule để tránh ID guessing/cross-case leakage.

## Transaction and consistency
- Ghi rõ package fallback có transactional requirement gì không.
- Ghi rõ attachment/reference writes nào phải đồng bộ với entity write chính.
- Chốt behavior khi storage/reference side effect fail nhưng business entity đã persist.

## Concurrency and idempotency
- Ghi policy cho repeated package fetch khi seed fallback được kích hoạt.
- Ghi policy cho repeated attachment/reference write hoặc duplicate proof submission nếu nằm trong demo path.
- Chốt overwrite/no-op/conflict behavior cho persisted refs.

## Observability and audit
- Log/audit fields tối thiểu: actorId, caseId, packageId, reportId, paymentId, ref field name, visibility scope, error code.
- Track riêng malformed ref, missing linked entity, leaked internal ref attempts.
- Không log full sensitive URL/tokenized ref nếu không cần.

## Test layering
- Unit: ref field validation, package fallback rules, exposure policy helpers.
- Integration: package fetch, attachment persistence, payment/report ref flows.
- Contract: package payload shape và attachment/reference fields frontend consume.
- Regression: empty DB fallback, malformed ref reject, hidden internal ref, duplicate/no-op ref writes.

## Related code files
- `apps/api/src/modules/packages/http/packages.routes.ts`
- `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/reports/domain/report.types.ts`
- `prisma/schema.prisma`

## Implementation Steps
1. Audit `GET /api/packages` contract và default seed behavior.
2. Ghi package fields nào là canonical business contract.
3. Ghi semantics cho toàn bộ attachment/reference-related fields trong case/report/payment flows.
4. Quyết định rõ backend hiện tại là reference-only hay cần upload contract mới.
5. Viết regression checklist cho create case, admin triage, assign, message, report, package retrieval.
6. Chốt những gì defer sau demo để tránh scope creep.
7. Lập matrix field-level cho `drive_folder_id`, `file_url`, `document_id`, `proof_file_url`, `drive_url`: source, owner, consumer, validation rule, public/private exposure.
8. Ghi edge cases cho empty package table, default seed fallback, malformed document refs, only-first-document persistence, legacy data shape.
9. Ghi error-handling table cho package fallback failure, invalid proof refs, missing linked document/report, storage boundary error.
10. Mở rộng regression checklist thành backend demo path checklist gồm happy path, validation fail path, forbidden path, not-found path, no-op/idempotent path.
11. Lập HTTP contract table cho package endpoint và attachment/reference-bearing payloads.
12. Lập authorization/exposure matrix cho package data và reference fields.
13. Ghi transaction boundary, concurrency/idempotency, và storage consistency policy.
14. Ghi observability/audit expectations cho packages/attachments.
15. Map checklist sang unit/integration/contract/regression tests.

## Todo list
- [ ] Audit package list contract
- [ ] Ghi default seed behavior
- [ ] Ghi canonical package fields
- [ ] Ghi attachment/reference semantics
- [ ] Quyết định reference-only vs upload contract
- [ ] Viết regression checklist backend demo path
- [ ] Ghi deferred items sau demo
- [ ] Lập validation matrix packages/attachments
- [ ] Ghi edge cases packages/attachments
- [ ] Ghi error-handling cases packages/attachments
- [ ] Lập HTTP contract packages/attachments
- [ ] Lập authorization/exposure matrix packages/attachments
- [ ] Ghi transaction/consistency policy packages/attachments
- [ ] Ghi concurrency/idempotency policy packages/attachments
- [ ] Ghi observability/audit policy packages/attachments
- [ ] Map test layers packages/attachments

## Success Criteria
- Package contract ổn định.
- Attachment/reference semantics không còn bị hiểu lầm.
- Có regression checklist rõ cho toàn bộ demo-critical backend path.
- Validation/error coverage đủ chi tiết để bắt được path hỏng trước khi frontend consume.

## Risk Assessment
- Risk trung bình nếu package seed behavior nằm ẩn và không được plan hóa.
- Risk cao nếu attachment fields bị dùng không nhất quán giữa modules.

## Security Considerations
- Validate file/reference inputs đúng scope.
- Không expose internal storage references không cần thiết ra public payload.

## Next steps
- Sau phase này, backend package đủ rõ để implement độc lập với frontend package.