# Backend/schema research report

## Scope
- Prisma schema
- create-case flow
- case detail flow
- upload-payment-proof flow
- admin price update flow

## Confirmed files
- `prisma/schema.prisma`
- `apps/api/src/modules/cases/application/create-case.usecase.ts`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts`
- `apps/api/src/modules/admin/application/update-package-price.usecase.ts`
- `apps/api/src/modules/admin/http/admin.controller.ts`
- `apps/api/src/modules/admin/http/admin.routes.ts`
- `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts`

## Findings
- Case currently has `package_id` and `payment_status`, but no visible locked price snapshot.
- Payment flow currently snapshots amount too late: upload-proof reads live `case.package.price`.
- create-case already fetches package and derives free/paid from current package price, so this is clean insertion point for `locked_price`.
- get-case-detail already returns package/payment-rich payload, so exposing `locked_price` is additive.
- admin package price update currently validates package + price, then writes new price only.
- package update path has no last-change metadata yet.
- `findCaseByIdWithAllRelations(...)` feeds both case detail and payment upload, so contract changes here ripple.

## Parallelization notes
- Schema/migration must run first.
- After schema lands, backend can split into 2 safe lanes:
  1. case/payment invariant lane
  2. admin package metadata lane
- Keep `package.repository.ts` owned by admin metadata lane only.
- Keep `case.repository.ts` owned by case/payment lane only.

## Risks
- Existing working tree already modifies admin/package backend files.
- Legacy unpaid/rejected cases cannot always reconstruct historical price exactly.
- Shared repository helpers can create hidden regressions if response shape changes too broadly.

## Unresolved questions
- Legacy backfill policy: accept approximation from current package price for unpaid/rejected cases?
- Admin metadata response via existing package APIs only, or separate admin endpoint fields?
