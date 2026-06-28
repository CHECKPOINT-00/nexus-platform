---
title: "API edge-case remediation plan"
description: "Kế hoạch chi tiết để vá auth, workflow, validation, và regression risks trong apps/api."
status: completed
priority: P2
effort: 14h
branch: ui/heroui-to-mantine
tags: [api, edge-cases, auth, validation, workflow]
created: 2026-06-28
---

# API edge-case remediation plan

## Mục tiêu
Giảm tối đa bug hiện có trong `apps/api` bằng cách chuẩn hóa auth/error semantics, gia cố state guards, siết validation, và thêm regression checks.

## Context
- Audit summary: [`reports/audit-summary-report.md`](./reports/audit-summary-report.md)
- Research 01: [`research/researcher-01-phase-structure.md`](./research/researcher-01-phase-structure.md)
- Research 02: [`research/researcher-02-file-scope.md`](./research/researcher-02-file-scope.md)

## Phases
- [x] Phase 01 — [Harden auth and shared guards](./phase-01-harden-auth-and-shared-guards.md) — 100%
- [x] Phase 02 — [Fix case route validation and workflow guards](./phase-02-fix-case-route-validation-and-workflow-guards.md) — 100%
- [x] Phase 03 — [Fix supporter and report lifecycle edges](./phase-03-fix-supporter-and-report-lifecycle-edges.md) — 100%
- [x] Phase 04 — [Fix admin, payments, packages, and ai-engine edges](./phase-04-fix-admin-payments-packages-and-ai-engine-edges.md) — 100%
- [x] Phase 05 — [Add regression validation and documentation follow-up](./phase-05-add-regression-validation-and-documentation-follow-up.md) — 100%

## Key dependencies
- Phase 01 trước tất cả phase còn lại.
- Phase 02 và 03 phụ thuộc semantics auth/error ổn định.
- Phase 04 phụ thuộc shared guard/validation đã rõ pattern.
- Phase 05 chạy sau khi code path chính đã vá xong.

## Critical files
- `apps/api/src/shared/infrastructure/authorization.ts`
- `apps/api/src/shared/infrastructure/middlewares/auth.ts`
- `apps/api/src/index.ts`
- `apps/api/src/modules/cases/presentation/http/cases.routes.ts`
- `apps/api/src/modules/supporter/presentation/http/supporter.routes.ts`
- `apps/api/src/modules/reports/presentation/http/reports.routes.ts`
- `apps/api/src/modules/admin/presentation/http/admin.routes.ts`
- `apps/api/src/modules/payments/presentation/http/payments.routes.ts`

## Success definition
- Không còn uncaught auth/session failures ở protected routes.
- 401/403/404/409 semantics nhất quán hơn.
- Workflow actions bị chặn đúng khi state invalid.
- Payment/admin edge cases không còn silent bad writes.
- Có compile + test/verification coverage cho path rủi ro cao.

## Validation Log

### Session 1 — 2026-06-28
**Trigger:** Initial plan creation validation trước khi implement.
**Questions asked:** 4

#### Questions & Answers

1. **[Architecture]** Với resource tồn tại nhưng user đã đăng nhập không có quyền, API nên trả gì?
   - Options: 403 giữ nguyên (Recommended) | 404 masking | Tùy endpoint
   - **Answer:** 403 giữ nguyên (Recommended)
   - **Rationale:** Quyết định này khóa semantics authz cho các helper và route protected, tránh drift giữa module và tránh phải thêm masking policy riêng cho từng endpoint.

2. **[Architecture]** Canonical payment status nên chốt theo hướng nào?
   - Options: paid canon (Recommended) | verified canon | Song song tạm thời
   - **Answer:** paid canon (Recommended)
   - **Rationale:** Quyết định này ảnh hưởng trực tiếp payment transition rules, mapping logic, response shape, và nơi cần migration/normalization khi vá drift status hiện có.

3. **[Architecture]** Giữa `reports.routes.ts` và `supporter.routes.ts`, hướng xử lý nào phù hợp hơn cho lifecycle draft/report?
   - Options: Giữ 2 route, chung rule (Recommended) | Ưu tiên supporter | Ưu tiên reports | Hợp nhất dần
   - **Answer:** Giữ 2 route, chung rule (Recommended)
   - **Rationale:** Quyết định này giữ nguyên API surface hiện tại để giảm blast radius frontend, nhưng buộc implementation phải đồng bộ guard/state rules ở cả hai route family.

4. **[Scope]** Phase test/verification nên đặt mức nào cho đợt này?
   - Options: API focused (Recommended) | Broader fullstack | Minimal smoke
   - **Answer:** API focused (Recommended)
   - **Rationale:** Quyết định này giữ effort tập trung vào backend regression risks đã audit, đồng thời tránh mở rộng scope sang fullstack khi chưa cần.

#### Confirmed Decisions
- Authz semantics: giữ 403 cho resource tồn tại nhưng unauthorized — rõ ràng và nhất quán cho protected API.
- Payment status canon: dùng `paid` làm trạng thái chuẩn — giảm drift về sau.
- Report lifecycle routing: giữ 2 route families nhưng dùng cùng rule set — giảm blast radius API contract.
- Verification scope: ưu tiên backend compile + API-focused tests — tập trung đúng vùng rủi ro.

#### Action Items
- [ ] Cập nhật Phase 03 để khóa policy 403 và rule đồng bộ cho `reports.routes.ts` + `supporter.routes.ts`.
- [ ] Cập nhật Phase 04 để khóa `paid` làm canonical payment status.
- [ ] Cập nhật Phase 05 để chốt verification scope theo hướng API focused.

#### Impact on Phases
- Phase 03: Giữ cả `reports.routes.ts` và `supporter.routes.ts`, nhưng áp cùng rule/guard; unauthorized existing resource trả 403.
- Phase 04: Chốt `paid` là canonical payment status; mọi normalization/transition follow theo hướng này.
- Phase 05: Ưu tiên compile + backend route/helper tests; frontend chỉ smoke khi có blast radius rõ.
