# Phase 02: case-payment-backend

## Context links
- Parent plan: [plan.md](./plan.md)
- Depends on: `./phase-01-schema-migration-backfill.md`
- Research: `./research/researcher-01-backend-schema-report.md`
- Source plan: `../260703-1352-price-locking-audit-trail/phase-02-backend-logic-fixes.md`

## Parallelization Info
- Can run in parallel with Phase 03 after Phase 01 completes.
- Must finish before Phase 04.
- No file overlap with Phase 03.

## Overview
- Date: 2026-07-03
- Description: Enforce case-level locked price for case creation, case detail payload, and payment proof upload.
- Priority: P2
- Implementation status: completed
- Review status: completed

## Key Insights
- create-case already fetches package price, so snapshot insertion point already exists.
- upload-payment-proof currently uses live `case.package.price`; this is root bug for old unpaid cases.
- `getCaseDetail` must expose `locked_price` so frontend can stop reading live catalog price.

## Requirements
- Persist `locked_price` at case creation.
- Use `locked_price` as payable amount for payment upload flow.
- Return `locked_price` in case detail response.
- Keep behavior backward-compatible for legacy records while migration/backfill settles.

## Architecture
- `ServicePackage.price` remains mutable catalog field.
- `Case.locked_price` becomes immutable per-case snapshot.
- Payment creation reads from case snapshot, not package catalog.
- Case detail response carries both package relation and locked price for additive rollout.
- <!-- Updated: Validation Session 1 - additive case detail contract --> Preserve live `package.price` in payload during rollout; frontend switches business decisions to `locked_price`.

## Related code files
- `apps/api/src/modules/cases/application/create-case.usecase.ts`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts`

## File Ownership
- `apps/api/src/modules/cases/application/create-case.usecase.ts`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts`

## Implementation Steps
1. Update create-case use case to derive `lockedPrice` from current package price.
2. Thread `lockedPrice` into case repository create transaction.
3. Persist `locked_price` on new cases.
4. Update case detail mapper/DTO to expose `locked_price`.
5. Change upload-payment-proof to use `case.locked_price`.
6. Guard missing/invalid locked price with clear error for corrupted legacy cases.
7. Run targeted backend tests for create case, case detail, and payment upload flows.

## Todo list
- [x] Snapshot locked price at case creation
- [x] Persist locked price in repository transaction
- [x] Expose locked price in case detail response
- [x] Use locked price in payment proof upload
- [x] Add/adjust focused backend tests

## Success Criteria
- New case before price change keeps old amount.
- New case after price change gets new amount.
- Upload proof creates payment amount from `locked_price`.
- Case detail API returns `locked_price`.
- Old paid-package cases are not reclassified by live package price.

## Conflict Prevention
- Phase owns all case/payment backend files exclusively.
- Must not modify package repository or admin package update files.
- Keep response changes additive to reduce frontend breakage before Phase 04 lands.

## Risk Assessment
- Shared repository helper changes can affect multiple endpoints.
- Legacy rows with unexpected null snapshot need safe fallback/error path.
- Existing tests may stub old payload shape and need careful updates.

## Security Considerations
- Preserve authorization and payment-status guards.
- Do not allow client-supplied payment amount.
- Error messages should not leak internal DB details.

## Next steps
- Hand locked-price payload contract to Phase 04.
- Coordinate final regression with payment UI after Phase 03 also lands.
