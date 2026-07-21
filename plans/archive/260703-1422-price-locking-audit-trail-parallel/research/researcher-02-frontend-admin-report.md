# Frontend/admin research report

## Scope
- Case/payment UI
- Supporter case UI
- Admin package settings UI
- Frontend types

## Confirmed files
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

## Findings
- Payment amount and free/paid guards are duplicated across payment page, payment drawer, unpaid banner, case detail page, supporter page.
- Current checks use live `caseData.package?.price`.
- `useAdminPackages()` reads `GET /packages`, so admin metadata display depends on package payload shape.
- `types/case.ts` and `types/package.ts` are shared fan-out points. Single phase should own them to avoid merge conflict.
- Admin UI metadata work is isolated from student/supporter payment UI once package payload includes new fields.

## Parallelization notes
- Frontend should remain one phase if it owns shared type files.
- Within phase, implement payment surfaces first, then supporter/detail guards, then admin metadata display.
- Frontend phase depends on backend case detail + package payload changes, but not on migration mechanics.

## Risks
- If payment page and drawer are split across agents, amount logic may drift.
- If backend omits `locked_price` for supporter payload, supporter page still breaks.
- Legacy fallback policy must be consistent everywhere: `locked_price ?? package?.price ?? 0`.

## Unresolved questions
- Show note like “Giá tại thời điểm đăng ký” when locked price differs from current package price?
- Expose raw `last_price_changed_by` id only, or display-friendly admin identity later?
