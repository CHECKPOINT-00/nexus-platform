# Brainstorm: User muốn tiếp tục sau khi hoàn tất gói 1

**Ngày:** 2026-07-06  
**Trạng thái:** Bàn luận — chưa implement  
**Bối cảnh:** Sau khi supporter close case (gói 1), student cảm thấy output chưa đủ và muốn hỗ trợ thêm. Hệ thống hiện không có path xử lý.

---

## Bản chất vấn đề

Case đã ở `user_facing_stage = "closed"`, `internal_status = "done"`. `isFinalCaseStage("closed") = true` — block toàn bộ mutation action trên case đó. Student cần thêm hỗ trợ nhưng không có cơ chế tiếp nối.

---

## Các hướng đã phân tích

### Hướng A: Mở thêm gói (extension) — tạo case mới linked

Student mua thêm "gói bổ sung" → tạo **case mới** với `parent_case_id` trỏ về case cũ.

**Pros:**
- Data model sạch — case cũ không bị mutate
- Billing rõ ràng, dễ audit từng case
- `isFinalCaseStage` không cần thay đổi

**Cons:**
- Student phải qua intake form lại — UX friction
- Lịch sử hỗ trợ bị split sang 2 case khác nhau
- Supporter cần xem cross-case context thủ công

---

### Hướng B: Reopen case + round mới

Admin/supporter "reopen" case đã closed → tạo round 2 trên cùng case.

Cần thêm: field `rounds` hoặc `extension_count`, refactor `isFinalCaseStage` logic, invoice riêng per round.

**Pros:**
- Lịch sử tập trung 1 case
- UX liền mạch cho student

**Cons:**
- Schema phức tạp — `isFinalCaseStage` hiện block 19+ callers
- Payment per-round phức tạp
- Nhiều technical debt, không phù hợp MVP

---

### Hướng C: Case mới + cross-reference UI *(Khuyến nghị MVP)*

Tạo case mới bình thường (gói 2 hoặc gói 1 lại). Trong intake form, student có thể chọn "Tiếp nối từ case trước" → lưu optional field `related_case_id` (hoặc `related_case_code` hiển thị thôi).

**Pros:**
- Zero schema breaking change
- Zero risk với logic hiện tại
- Supporter thấy context từ case cũ nếu student điền
- Ship nhanh

**Cons:**
- Không enforce — student có thể không điền `related_case_code`
- Supporter vẫn phải mở tab khác để xem case cũ

---

### Hướng D: Stage `extended` thay vì `closed`

Thay vì `closed`, supporter chuyển sang stage `extended` để student submit thêm. Payment gắn theo stage mới.

**Pros:**
- UX liền mạch nhất

**Cons:**
- Phá concept "gói 1 = one-shot"
- Billing không rõ ràng
- `isFinalCaseStage` cần refactor sâu
- Không phù hợp MVP

---

## Kết luận

| Hướng | Effort | Risk | Phù hợp MVP |
|-------|--------|------|-------------|
| A (case mới linked) | Trung bình | Thấp | ✅ Dài hạn |
| B (reopen + round) | Cao | Cao | ❌ |
| C (case mới + cross-ref) | Thấp | Thấp | ✅ **Ngắn hạn** |
| D (stage extended) | Cao | Cao | ❌ |

**Ngắn hạn (hiện tại):** Hướng C — thêm optional field `related_case_code` vào intake form. Zero schema change. Supporter có context nếu student điền.

**Dài hạn (khi product grow):** Hướng A với UX tốt hơn — "Gia hạn case" flow riêng, pre-fill intake từ case cũ, không bắt student nhập lại từ đầu, hiển thị parent case trong supporter workspace.

---

## Open questions chưa giải quyết

- Gói bổ sung (add-on) sau gói 1 có giá riêng không, hay mua thêm gói 1/2 bình thường?
- Student tự tạo case mới hay phải liên hệ admin trước?
- Supporter được phân công lại case mới có ưu tiên supporter cũ không?
