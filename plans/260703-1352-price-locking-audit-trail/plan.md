---
status: pending
created: 2026-07-03
feature: price-locking-audit-trail
---

# Plan: Price Locking & Last-Change Metadata

## Context

Plan cũ `260703-1227-admin-package-price-setting` đã có endpoint + UI cho admin đổi giá gói. Nhưng root bug vẫn còn: khi admin đổi giá, cases cũ bị ảnh hưởng vì không có snapshot giá trên `Case` tại lúc tạo case.

Chi tiết xem tại: **[Brainstorm Report](../reports/260703-price-change-brainstorm-report.md)** và review note trong `plans/reports/a.md`.

**Root cause:**
- `Case` chưa có `locked_price` làm source of truth per-case
- Một số backend/frontend flow vẫn đọc live `package.price`
- `upload-payment-proof.usecase` snapshot giá lúc upload là quá muộn

## Goal

1. Snapshot `locked_price` trên từng case ngay lúc create-case flow
2. Mọi quyết định “case này có cần thanh toán không / số tiền bao nhiêu” dùng `Case.locked_price`, không dùng live `ServicePackage.price`
3. Khi admin đổi giá → chỉ cases mới ăn giá mới; cases cũ giữ nguyên giá đã lock
4. Lưu metadata lần đổi giá gần nhất trên `ServicePackage` (`previous_price`, `last_price_changed_at`, `last_price_changed_by`)
5. Chốt rõ business decision cho legacy unpaid/rejected cases vì không thể luôn suy ra đúng giá gốc

## Phases

- **[Phase 01: Schema Migration & Backfill](./phase-01-schema-migration.md)** — `[pending]`
- **[Phase 02: Backend Logic Fixes](./phase-02-backend-logic-fixes.md)** — `[pending]`
- **[Phase 03: Frontend Display Fixes](./phase-03-frontend-display-fixes.md)** — `[pending]`

## Edge Cases Covered

| # | Scenario | Covered By |
|---|----------|-----------|
| E1 | Chưa upload proof, admin đổi giá → UI hiện sai | Phase 01 + 03 |
| E2 | Pending verification, reject, resubmit sau khi giá đổi | Phase 01 + 02 + 03 |
| E3 | Admin đổi giá paid -> free, case cũ unpaid bị coi như free | Phase 02 + 03 |
| E4 | Race condition: upload đúng lúc giá thay đổi | Phase 02 (lock lúc create) |
| E5 | Case detail API không expose `locked_price`, frontend không dùng được | Phase 02 |
| E6 | Legacy unpaid/rejected không suy ra chắc giá gốc | Phase 01 decision |
| E7 | User resubmit sau reject, không biết giá đã đổi | Phase 03 UI |
| E8 | Không có metadata lần đổi giá gần nhất | Phase 02 |

## Key Constraints

1. **Backward compat:** `locked_price` nullable lúc migration, nhưng code mới phải guard rõ với legacy gaps
2. **No per-case override trong scope này:** Giá đã lock là source of truth; discount/history table ngoài scope
3. **Migration trước deploy:** Phải backfill data cũ trước khi deploy guard mới
4. **Known limitation:** legacy unpaid/rejected cases không thể always reconstruct đúng giá gốc nếu DB chưa từng snapshot

## Main Touch Areas

### Database
- `prisma/schema.prisma` — thêm `locked_price`, package last-change metadata

### Backend API
- `apps/api/src/modules/cases/application/create-case.usecase.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`
- `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`
- `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts`
- `apps/api/src/modules/admin/application/update-package-price.usecase.ts`
- `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts`

### Frontend Web
- `apps/web-1/app/dashboard/case/[id]/payment/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/UnpaidAlertBanner.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/PaymentDrawer.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/types/case.ts`
- `apps/web-1/types/package.ts`

## Success Criteria

- [ ] Create-case trước đổi giá → `Case.locked_price = old price`
- [ ] Create-case sau đổi giá → `Case.locked_price = new price`
- [ ] `getCaseDetail` response expose `locked_price` cho frontend
- [ ] Mọi guard free/paid, amount display, QR/payment amount dùng `locked_price`
- [ ] Admin đổi giá → cases cũ vẫn hiển thị và dùng giá cũ
- [ ] User resubmit payment sau reject → vẫn thấy đúng giá lúc đăng ký
- [ ] Metadata lần đổi giá gần nhất trả về đúng cho admin UI
- [ ] Có decision rõ cho legacy unpaid/rejected backfill; không gọi nhầm là full audit trail
