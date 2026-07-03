---
title: "Price locking audit trail parallel plan"
description: "Parallel-safe plan for locked case price and package last-change metadata."
status: completed
priority: P2
effort: 5h
branch: staging
tags: [pricing, payments, cases, admin, parallel]
created: 2026-07-03
---

# Price locking audit trail

## Goal
Freeze payable amount on case at create time. Keep old cases stable after package price changes. Expose latest package price-change metadata for admin UI.

## Dependency graph
```text
Phase 01 Schema + backfill
  ├─> Phase 02 Case/payment backend
  └─> Phase 03 Package metadata backend
Phase 02 ─┐
          ├─> Phase 04 Frontend surfaces
Phase 03 ─┘
```

## Execution strategy
- Sequential first: Phase 01.
- Parallel next: Phase 02 + Phase 03.
- Sequential finish: Phase 04.
- Validation after implementation: targeted backend tests + web compile/type checks + focused regression review.

## Parallel groups
- G0: Phase 01
- G1: Phase 02, Phase 03
- G2: Phase 04

## File ownership matrix
| File | Phase |
|---|---|
| `prisma/schema.prisma` | 01 |
| migration/backfill artifacts under `prisma/` | 01 |
| `apps/api/src/modules/cases/application/create-case.usecase.ts` | 02 |
| `apps/api/src/modules/cases/application/get-case-detail.usecase.ts` | 02 |
| `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts` | 02 |
| `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts` | 02 |
| `apps/api/src/modules/admin/application/update-package-price.usecase.ts` | 03 |
| `apps/api/src/modules/admin/http/admin.controller.ts` | 03 |
| `apps/api/src/modules/admin/http/admin.routes.ts` | 03 |
| `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts` | 03 |
| `apps/web-1/types/case.ts` | 04 |
| `apps/web-1/types/package.ts` | 04 |
| `apps/web-1/app/dashboard/case/[id]/page.tsx` | 04 |
| `apps/web-1/app/dashboard/case/[id]/payment/page.tsx` | 04 |
| `apps/web-1/app/dashboard/case/[id]/_components/UnpaidAlertBanner.tsx` | 04 |
| `apps/web-1/app/dashboard/case/[id]/_components/PaymentDrawer.tsx` | 04 |
| `apps/web-1/app/supporter/case/[id]/page.tsx` | 04 |
| `apps/web-1/app/admin/page.tsx` | 04 |
| `apps/web-1/app/admin/hooks/useAdminPackages.ts` | 04 |
| `apps/web-1/app/admin/_components/AdminPackagesSettings.tsx` | 04 |

## Phases
- [Phase 01 — schema-migration-backfill](./phase-01-schema-migration-backfill.md) `[completed]` `group:G0` `100%`
- [Phase 02 — case-payment-backend](./phase-02-case-payment-backend.md) `[completed]` `group:G1` `100%`
- [Phase 03 — package-metadata-backend](./phase-03-package-metadata-backend.md) `[completed]` `group:G1` `100%`
- [Phase 04 — frontend-surfaces](./phase-04-frontend-surfaces.md) `[completed]` `group:G2` `100%`

## Key decisions
- `Case.locked_price` is source of truth for payable amount.
- Legacy unpaid/rejected cases backfill with current package price when no payment amount exists; document as approximation, not full historical reconstruction.
- Package audit scope is latest-change metadata only, not full history table.
- Frontend fallback for legacy gaps: `locked_price ?? package?.price ?? 0`.

## Research inputs
- `./research/researcher-01-backend-schema-report.md`
- `./research/researcher-02-frontend-admin-report.md`

## Validation Log

### Session 1 — 2026-07-03
**Trigger:** Initial plan creation validation
**Questions asked:** 3

#### Questions & Answers

1. **[Assumptions]** For legacy cases without any payment record, how should locked_price be backfilled?
   - Options: Use current price (Recommended) | Manual review | Block release
   - **Answer:** Assumed `Use current price (Recommended)` due to no user response.
   - **Rationale:** This keeps scope implementable now and matches documented approximation limits for legacy unpaid/rejected cases.

2. **[Architecture]** When case detail returns locked_price, should frontend still keep live package.price in payload too?
   - Options: Return both (Recommended) | Locked only | Frontend computes
   - **Answer:** Assumed `Return both (Recommended)` due to no user response.
   - **Rationale:** Additive payload avoids breaking existing consumers while allowing frontend to migrate payment logic safely.

3. **[Scope]** For last_price_changed_by in admin package metadata, what should Phase 03 expose now?
   - Options: Raw admin id (Recommended) | Resolved name | Hide actor
   - **Answer:** Assumed `Raw admin id (Recommended)` due to no user response.
   - **Rationale:** Smallest backend scope. Avoids extra joins or UI identity work while still preserving audit attribution.

#### Confirmed Decisions
- Legacy backfill: use current package price when no payment exists — keeps release scope small.
- Case detail contract: return both `locked_price` and live `package.price` — additive rollout.
- Admin actor metadata: expose raw authenticated admin id only — no display-name expansion now.

#### Action Items
- [x] Keep approximation wording explicit in migration/backfill implementation.
- [x] Keep case detail response additive with both price fields.
- [x] Keep actor metadata naming scoped to raw id only.

#### Impact on Phases
- Phase 01: Document approximation policy for legacy unpaid/rejected backfill.
- Phase 02: Keep case detail payload additive with `locked_price` plus existing package relation.
- Phase 03: Limit actor metadata scope to raw admin id.

## Unresolved questions
- No blocking questions. Validation proceeded with recommended defaults after no user response.
