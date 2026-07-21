# Researcher 02 — File scope

## High-Impact Files
- `apps/api/src/shared/infrastructure/authorization.ts`
- `apps/api/src/shared/infrastructure/middlewares/auth.ts`
- `apps/api/src/index.ts`
- `apps/api/src/modules/cases/presentation/http/cases.routes.ts`
- `apps/api/src/modules/supporter/presentation/http/supporter.routes.ts`
- `apps/api/src/modules/reports/presentation/http/reports.routes.ts`
- `apps/api/src/modules/admin/presentation/http/admin.routes.ts`
- `apps/api/src/modules/payments/presentation/http/payments.routes.ts`
- `apps/api/src/modules/packages/presentation/http/packages.routes.ts`
- `apps/api/src/modules/ai-engine/presentation/http/ai-engine.routes.ts`

## Suggested Change Buckets
1. Shared auth/access helpers
2. Shared validation/error helpers
3. Case workflow guards
4. Report/supporter lifecycle guards
5. Admin/payment input + state validation

## Test Targets
- Auth/session failure paths
- Role matrix: admin/supporter/member/owner/unknown
- Missing resource vs unauthorized resource
- Invalid transition matrix for case/report actions
- Payment verification/rejection replay

## Risks
- `cases.routes.ts` và `supporter.routes.ts` chứa nhiều nhánh logic, file lớn.
- Một số route dùng helper chung, số khác tự check session/role.
- Có drift semantics giữa status/payment/report state.

## Unresolved Questions
- Có existing API test pattern nào trong repo để bám theo không?
- `reports.routes.ts` và `supporter.routes.ts` có cần giữ song song hay hợp thức hóa cùng rule set?
