# Phase 02: Backend Logic Fixes

**Status:** `[pending]`
**Depends on:** Phase 01 (schema migration done, prisma client regenerated)
**Blocks:** Phase 03

---

## Overview

Cập nhật backend invariant:
1. **Create-case flow** — snapshot `locked_price` ngay lúc tạo case
2. **Case detail response** — expose `locked_price` cho frontend
3. **upload-payment-proof** — dùng `locked_price` thay vì live `package.price`
4. **updatePackagePrice** — lưu last-change metadata khi giá thay đổi

---

## Tasks

### 1. Create-case Flow: Snapshot `locked_price` Ngay Lúc Tạo `[pending]`

**Files chính cần sửa:**
- `apps/api/src/modules/cases/application/create-case.usecase.ts`
- `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts`

**Logic cần chốt:**
- Fetch package trước khi tạo case
- Dùng `pkg.price` làm `lockedPrice`
- `isFree` derive từ `lockedPrice === 0`
- Truyền `lockedPrice` xuống repository và persist ngay trong `tx.case.create`

```typescript
const pkg = await findPackageById(packageId);
if (!pkg) {
  throw new AppError(404, "PACKAGE_NOT_FOUND", "Không tìm thấy gói dịch vụ");
}

const lockedPrice = pkg.price;
const isFree = lockedPrice === 0;

await createCaseWithCheckpointAndIntake({
  // ...existing payload
  packageId,
  lockedPrice,
});
```

**Repository change cần có:**
```typescript
await tx.case.create({
  data: {
    // ...existing fields
    package_id: input.packageId,
    locked_price: input.lockedPrice,
  },
});
```

**Invariant sau phase này:**
- Mọi quyết định “case này có cần thanh toán không / số tiền bao nhiêu” phải dựa trên `Case.locked_price`
- Không derive lại từ `ServicePackage.price` ở các flow xử lý case hiện hữu

---

### 2. Expose `locked_price` Trong Case Detail API `[pending]`

**File:** `apps/api/src/modules/cases/application/get-case-detail.usecase.ts`

**Thay đổi:**
- Update mapper `toBaseResponse()` để trả `locked_price`
- Nếu có DTO/type response riêng liên quan case detail, update cùng lúc

```typescript
return {
  id: item.id,
  package_id: item.package_id,
  locked_price: item.locked_price,
  package: item.package,
  payments: item.payments,
  // ...existing fields
};
```

**Lý do:** frontend không thể đổi sang `locked_price` nếu API vẫn không expose field này.

---

### 3. Update `upload-payment-proof.usecase.ts` `[pending]`

**File:** `apps/api/src/modules/payments/application/upload-payment-proof.usecase.ts`

**Thay đổi:**
```typescript
const amount = caseObj.locked_price;

if (amount === null || amount === undefined) {
  throw new AppError(
    400,
    "MISSING_LOCKED_PRICE",
    "Case chưa có giá gói được khóa. Vui lòng liên hệ admin."
  );
}

if (amount <= 0) {
  throw new AppError(
    400,
    "INVALID_AMOUNT",
    "Gói dịch vụ miễn phí, không cần thanh toán."
  );
}
```

**Notes:**
- Không dùng `caseObj.package.price` nữa
- Rejected resubmission phải tiếp tục tạo `Payment.amount = locked_price`
- `findCaseByIdWithAllRelations` đọc field trực tiếp từ `Case`, nên thường không cần include riêng cho `locked_price`

---

### 4. Update `updatePackagePriceUseCase` — Lưu Last-Change Metadata `[pending]`

**Files:**
- `apps/api/src/modules/admin/application/update-package-price.usecase.ts`
- `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts`
- `apps/api/src/modules/admin/http/admin.controller.ts`

**Thêm:**
- Nhận `adminId: string`
- Lưu `previous_price`, `last_price_changed_at`, `last_price_changed_by`

```typescript
export async function updatePackagePriceUseCase(
  packageId: string,
  price: number,
  adminId: string
) {
  const pkg = await findPackageById(packageId);
  if (!pkg) throw new Error("Không tìm thấy gói dịch vụ");

  return await updatePackagePrice(packageId, price, {
    previousPrice: pkg.price,
    changedAt: new Date(),
    changedBy: adminId,
  });
}
```

**Wording scope:**
- Đây là metadata lần đổi gần nhất
- Không gọi là full audit trail nếu chưa có bảng history riêng

---

### 5. Response Shape — Expose Metadata Fields `[pending]`

Sau khi update, response từ admin API nên trả đủ fields cho admin UI:

```typescript
return c.json({
  ok: true,
  data: {
    id: result.id,
    name: result.name,
    price: result.price,
    previous_price: result.previous_price,
    last_price_changed_at: result.last_price_changed_at,
    last_price_changed_by: result.last_price_changed_by,
  },
});
```

---

## Backend Test Scope

- Create case trước đổi giá -> `Case.locked_price = old price`
- Create case sau đổi giá -> `Case.locked_price = new price`
- `getCaseDetailUseCase` trả `locked_price`
- Upload proof dùng `locked_price`, không dùng `package.price`
- Rejected resubmission vẫn tạo `Payment.amount = locked_price`
- Package đổi từ paid -> free không làm case cũ unpaid bị coi là free

## Notes

- `locked_price` trên Case là immutable sau khi create trong scope hiện tại
- Không cần đổi `verifyPaymentUseCase` nếu nó chỉ verify trên `Payment.amount`
- Nếu phát hiện flow backend khác vẫn đọc live `package.price` để quyết định payment, phải đổi sang `locked_price` cùng invariant trên
