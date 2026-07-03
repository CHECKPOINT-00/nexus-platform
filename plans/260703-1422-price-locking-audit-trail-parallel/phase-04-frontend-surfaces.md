# Phase 04: frontend-surfaces

## Context links
- Parent plan: [plan.md](./plan.md)
- Depends on: `./phase-02-case-payment-backend.md`, `./phase-03-package-metadata-backend.md`
- Research: `./research/researcher-02-frontend-admin-report.md`
- Source plan: `../260703-1352-price-locking-audit-trail/phase-03-frontend-display-fixes.md`

## Parallelization Info
- Runs after Phase 02 and Phase 03.
- No safe parallel split inside this plan because shared type files and payment UX are tightly coupled.
- Owns all frontend files listed below exclusively.

## Overview
- Date: 2026-07-03
- Description: Switch case/payment UI to locked-price semantics and show latest package metadata in admin UI.
- Priority: P2
- Implementation status: completed
- Review status: completed

## Key Insights
- Current free/paid checks are duplicated across multiple screens.
- Payment page and drawer both render amount; single owner prevents drift.
- Admin metadata display is isolated once package payload includes additive fields.

## Requirements
- Add `locked_price` to case type.
- Add package metadata fields to package type.
- Replace live-price checks with `locked_price ?? package?.price ?? 0` in affected UI.
- Use locked/effective price for payment display, redirect guard, banner, supporter warning.
- Show latest package change metadata in admin package settings without implying full history.

## Architecture
- Frontend remains additive and fallback-safe for legacy cases.
- Effective price computation stays local in each touched screen unless existing shared helper already fits.
- Admin package hook continues reading existing package endpoint.

## Related code files
- `apps/web-1/types/case.ts`
- `apps/web-1/types/package.ts`
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/payment/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/UnpaidAlertBanner.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/PaymentDrawer.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/admin/page.tsx`
- `apps/web-1/app/admin/hooks/useAdminPackages.ts`
- `apps/web-1/app/admin/_components/AdminPackagesSettings.tsx`

## File Ownership
- `apps/web-1/types/case.ts`
- `apps/web-1/types/package.ts`
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/payment/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/UnpaidAlertBanner.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/PaymentDrawer.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/admin/page.tsx`
- `apps/web-1/app/admin/hooks/useAdminPackages.ts`
- `apps/web-1/app/admin/_components/AdminPackagesSettings.tsx`

## Implementation Steps
1. Extend shared case/package types with additive fields.
2. Update payment page redirect and amount display to use effective locked price.
3. Update payment drawer amount and optional note when locked price differs from current package price.
4. Update unpaid banner and case detail page guards to use effective locked price.
5. Update supporter page warning logic to use effective locked price.
6. Update admin package settings UI to show last-change metadata.
7. Run web compile/type checks and manually verify old/new case scenarios.

## Todo list
- [x] Add case/package type fields
- [x] Switch payment page to effective locked price
- [x] Switch payment drawer to effective locked price
- [x] Switch unpaid banner and case detail guards
- [x] Switch supporter warning guard
- [x] Show package metadata in admin settings
- [x] Run frontend verification

## Success Criteria
- Free/paid redirect uses locked price.
- Payment amount shown in page and drawer matches locked price.
- Student/supporter warnings no longer change when catalog price changes later.
- Admin package settings shows latest update timestamp and previous price when available.
- Legacy cases still render via fallback.

## Conflict Prevention
- Phase owns shared frontend type files and all payment/admin UI files exclusively.
- No backend edits in this phase.
- One owner handles both payment page and drawer to prevent amount drift.

## Risk Assessment
- Shared type edits can ripple across app if field names mismatch backend payload.
- Legacy fallback may hide data quality issues if not tested explicitly.
- Admin metadata timestamp formatting can vary if null/invalid not handled.

## Security Considerations
- Frontend must never calculate payable amount from user input.
- Admin metadata display should not expose more than intended actor identifier.
- Keep authorization assumptions in backend; frontend changes are display-only.

## Next steps
- After implementation, run focused regression on create old/new case price scenarios, rejected payment resubmission, and admin package metadata display.
