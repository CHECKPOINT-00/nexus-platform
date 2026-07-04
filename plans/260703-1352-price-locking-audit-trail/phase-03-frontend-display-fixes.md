# Phase 03: Frontend Display Fixes

**Status:** `[pending]`
**Depends on:** Phase 01 (types updated), Phase 02 (API returns locked_price)
**Blocks:** nothing

---

## Overview

Cập nhật TypeScript types và toàn bộ UI đang đọc live `package.price` để dùng `locked_price` làm nguồn chính. Đảm bảo mọi guard free/paid, banner, redirect, amount display, QR amount đều bám theo giá đã lock của case.

---

## Tasks

### 1. Update TypeScript Types `[pending]`

**File:** `apps/web-1/types/case.ts`
```typescript
export interface Case {
  // ...existing fields...
  locked_price?: number | null;
}
```

**File:** `apps/web-1/types/package.ts`
```typescript
export interface ServicePackage {
  // ...existing fields...
  previous_price?: number | null;
  last_price_changed_at?: string | null;
  last_price_changed_by?: string | null;
}
```

---

### 2. Replace Frontend Free/Paid Guards Sang `locked_price` `[pending]`

**Files phải cover:**
- `apps/web-1/app/dashboard/case/[id]/payment/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/UnpaidAlertBanner.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`

**Rule chung:**
```tsx
const lockedPrice = caseData.locked_price ?? caseData.package?.price ?? 0;
const isFreeCase = lockedPrice === 0;
```

**Dùng cho:**
- redirect “gói free thì không vào payment page”
- hide/show unpaid banner
- supporter warning / payment-needed status
- mọi conditional UI đang check `caseData.package?.price === 0`

**Fallback policy:**
- Chỉ fallback `package.price` cho dữ liệu legacy khi `locked_price` chưa có
- Ghi note TODO rõ nếu fallback còn tạm thời

---

### 3. Fix `PaymentDrawer.tsx` — Hiển Thị `locked_price` `[pending]`

**File:** `apps/web-1/app/dashboard/case/[id]/_components/PaymentDrawer.tsx`

**Thay đổi chính:**
```tsx
{formatPrice(caseData.locked_price ?? caseData.package?.price ?? 0)}
```

**Áp dụng cho toàn bộ:**
- displayed amount
- transfer summary
- QR amount / copied amount
- text giải thích liên quan payment

**Optional UX note khi giá đã đổi sau đăng ký:**
```tsx
{caseData.locked_price !== null &&
 caseData.locked_price !== undefined &&
 caseData.package?.price !== undefined &&
 caseData.locked_price !== caseData.package.price && (
  <p className="text-[10px] text-text-muted italic mt-0.5">
    Giá tại thời điểm đăng ký
  </p>
)}
```

---

### 4. Update Admin Package Panel — Hiển Thị Last-Change Metadata `[pending]`

**Files liên quan:**
- `apps/web-1/app/admin/page.tsx`
- `apps/web-1/app/admin/_components/AdminPackagesSettings.tsx`
- `apps/web-1/app/admin/hooks/useAdminPackages.ts`

UI có thể hiển thị:
```tsx
{pkg.last_price_changed_at && (
  <Text size="xs" c="dimmed">
    Cập nhật lần cuối: {new Date(pkg.last_price_changed_at).toLocaleString("vi-VN")}
    {pkg.previous_price !== null && ` (từ ${formatPrice(pkg.previous_price)})`}
  </Text>
)}
```

**Scope note:**
- Hiển thị metadata lần đổi gần nhất
- Không mô tả như full audit history

---

## QA Checklist

### Frontend

- [ ] Payment page redirect dùng `locked_price === 0`
- [ ] Case detail page unpaid banner dùng `locked_price`
- [ ] Supporter page warning dùng `locked_price`
- [ ] PaymentDrawer displayed amount + QR amount dùng `locked_price`
- [ ] Legacy case chưa có `locked_price` vẫn render được nhờ fallback tạm thời

### Cross-scenario

- [ ] Case tạo trước khi admin đổi giá vẫn hiện giá cũ ở mọi màn liên quan payment
- [ ] Case tạo sau khi admin đổi giá hiện giá mới
- [ ] Admin đổi gói paid -> free không làm case cũ unpaid bị redirect sai như free case
- [ ] Rejected/resubmit flow vẫn giữ đúng amount lúc đăng ký
