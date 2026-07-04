# Brainstorm Report: Price Change Logic & Edge Cases
**Date:** 2026-07-03
**Status:** Reviewed

---

## 1. Problem Statement & Root Cause

Admin có thể thay đổi giá `ServicePackage` bất kỳ lúc nào qua `updatePackagePriceUseCase`.  
Yêu cầu: cases đã đăng ký với giá cũ phải giữ nguyên giá đó; giá mới chỉ áp dụng cho các cases về sau.

**Root bug hiện tại:**
- `PaymentDrawer.tsx` hiển thị `caseData.package?.price` (live price) -> sai khi giá đổi.
- `upload-payment-proof.usecase.ts` snapshot `caseObj.package.price` tại lúc upload -> quá muộn, user có thể đã CK theo giá khác hiển thị trên UI.
- Không có cơ chế lock giá tại thời điểm đăng ký (intake).

---

## 2. Edge Cases

### 🔴 Critical
- **E1:** Case đã chọn gói, chưa upload proof, admin đổi giá -> UI hiện giá mới -> user đã CK giá cũ -> admin verify bị lệch amount.
- **E2:** Case `pending_verification` -> bị admin reject -> user resubmit sau khi giá đổi -> lần resubmit dùng giá mới -> lệch với payment record cũ.
- **E3:** Admin đổi giá về 0 với cases đang pending flow -> payment flow bị crash do guard `amount <= 0`.

### 🟡 Important
- **E4:** Race condition: upload đúng lúc giá thay đổi -> snapshot amount không nhất quán.
- **E7:** User resubmit sau reject, không biết giá đã đổi -> CK sai số tiền -> bị reject tiếp.

### 🟢 Nice-to-have
- **E8:** Không có audit log: ai đổi, khi nào, giá cũ là bao nhiêu.

---

## 3. Recommended Solution (Option A)

Thêm `locked_price` vào model `Case` để lưu snapshot giá tại thời điểm chọn gói.

### Schema Change
```prisma
model Case {
  // ...
  locked_price  Int?   // Snapshot của ServicePackage.price tại thời điểm user chọn gói trong intake
}

model ServicePackage {
  // ...
  previous_price          Int?
  last_price_changed_at   DateTime?
  last_price_changed_by   String?   // auth_user_id của admin
}
```

### Logic Changes
1. **Intake/Assign Package:** Khi user chọn gói -> gán `Case.locked_price = ServicePackage.price`.
2. **PaymentDrawer:** Hiển thị `locked_price ?? package.price`. Nếu khác nhau, hiển thị label cảnh báo: *"Giá tại thời điểm đăng ký"*.
3. **Upload Proof Usecase:** Dùng `Case.locked_price` làm `amount`. Thêm guard check null.
4. **Update Price Usecase:** Lưu thêm `previous_price`, `last_price_changed_at`, và `last_price_changed_by`.

---

## 4. Backfill Strategy (Cho data cũ)
- Cases đã `paid` và có payment record: Lấy `Payment.amount` làm `locked_price`.
- Cases chưa có payment record: Lấy `ServicePackage.price` hiện tại.
