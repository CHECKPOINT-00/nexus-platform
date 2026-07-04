# Phase 01: Schema Migration & Backfill

**Status:** `[pending]`
**Depends on:** nothing
**Blocks:** Phase 02, Phase 03

---

## Overview

Thêm `locked_price` vào model `Case` và thêm metadata lần đổi giá gần nhất vào `ServicePackage`. Thực hiện migration + backfill data cũ trước khi deploy code mới.

---

## Tasks

### 1. Update Prisma Schema `[pending]`

**File:** `prisma/schema.prisma`

**Thêm vào model `Case`:**
```prisma
model Case {
  // ...existing fields...
  locked_price  Int?   // Snapshot của ServicePackage.price tại thời điểm create case
}
```

**Thêm vào model `ServicePackage`:**
```prisma
model ServicePackage {
  // ...existing fields...
  previous_price          Int?
  last_price_changed_at   DateTime?
  last_price_changed_by   String?   // auth_user_id của admin thực hiện thay đổi
}
```

**Notes:**
- Tất cả fields mới đều nullable — không break existing records
- `last_price_changed_by` là String tham chiếu user_id, không cần FK trong scope này
- Đây là last-change metadata, không phải full audit history table

---

### 2. Tạo Migration `[pending]`

```bash
npm run prisma:migrate
# Đặt tên migration: add_locked_price_and_package_last_change_metadata
```

Kiểm tra migration file sinh ra đúng SQL:
```sql
ALTER TABLE "cases" ADD COLUMN "locked_price" INTEGER;
ALTER TABLE "service_packages" ADD COLUMN "previous_price" INTEGER;
ALTER TABLE "service_packages" ADD COLUMN "last_price_changed_at" TIMESTAMP(3);
ALTER TABLE "service_packages" ADD COLUMN "last_price_changed_by" TEXT;
```

---

### 3. Backfill Data Cũ `[pending]`

**Mục tiêu:** Giảm khoảng trống dữ liệu cho cases hiện có trước khi Phase 02 deploy guard.

**Backfill mặc định:**
- Cases đã có payment record: lấy `Payment.amount` làm `locked_price`
- Cases chưa có payment record: tạm lấy `ServicePackage.price` hiện tại

**Known limitation / business decision cần chốt trong plan triển khai:**
- Legacy unpaid/rejected cases không thể luôn suy ra đúng giá gốc nếu DB chưa từng lưu snapshot
- Phương án scope hiện tại: **accept approximation** cho legacy unpaid/rejected bằng `current package.price`
- Nếu business không chấp nhận approximation, phải đổi scope sang manual review hoặc historical reconstruction

**Script backfill (chạy 1 lần trong migration hoặc one-off script):**
```typescript
const cases = await prisma.case.findMany({
  where: { locked_price: null, package_id: { not: null } },
  include: {
    package: true,
    payments: { orderBy: { created_at: 'asc' }, take: 1 },
  },
});

for (const c of cases) {
  const lockedPrice = c.payments[0]?.amount ?? c.package?.price ?? 0;

  await prisma.case.update({
    where: { id: c.id },
    data: { locked_price: lockedPrice },
  });
}
```

**Verification query sau backfill:**
```sql
SELECT COUNT(*) FROM cases WHERE package_id IS NOT NULL AND locked_price IS NULL;
-- Phải trả về 0
```

**Manual verification thêm:**
```sql
SELECT id, package_id, locked_price, payment_status
FROM cases
WHERE package_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
```

---

### 4. Regenerate Prisma Client `[pending]`

```bash
npm run prisma:generate
```

---

## Rollback Plan

Nếu cần rollback:
```sql
ALTER TABLE "cases" DROP COLUMN "locked_price";
ALTER TABLE "service_packages" DROP COLUMN "previous_price";
ALTER TABLE "service_packages" DROP COLUMN "last_price_changed_at";
ALTER TABLE "service_packages" DROP COLUMN "last_price_changed_by";
```

Không ảnh hưởng code cũ vì trước đó chưa có logic nào phụ thuộc các fields này.
