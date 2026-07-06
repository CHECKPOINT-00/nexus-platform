# Phân Tích Payment Timing & Trust Model cho Nexus

**Dựa trên:** [report-260704-1930-payment-timing-trust-model.md](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/plans/reports/report-260704-1930-payment-timing-trust-model.md)
**Ngày phân tích:** 2026-07-04
**Version:** 2.0 — đã sửa theo review feedback
**Status:** Đề xuất — chờ duyệt

### Changelog v2.0

- Sửa mâu thuẫn lập luận: hạ vai trò doctor booking, consulting firm lên làm ví dụ chính.
- Thêm giới hạn chống spam triage (max case `awaiting_payment` đồng thời).
- Chốt rõ flow cho case `expired` (re-activate vs re-submit).
- Thêm chính sách refund 3 tầng (khoảng giữa paid → báo cáo gửi).
- Thêm bước user xác nhận package/giá trước khi thấy CTA thanh toán.

---

## 1. Các Dịch Vụ Ngoài Kia Đang Xử Lý Thế Nào?

### Bảng so sánh dịch vụ thực tế

| Dịch vụ | Mô hình | Khi nào thu tiền | Trust signal trước khi thu | Phù hợp Nexus? |
|---------|---------|------------------|---------------------------|----------------|
| **Consulting firms nhỏ (VN)** | Tư vấn sơ bộ free → pay to start | Sau buổi tư vấn miễn phí | Buổi tư vấn = chứng minh năng lực + xác nhận scope | ✅ **Pattern phù hợp nhất** |
| **Doctor booking (Docosan, Jio Health)** | Pay-at-booking | Sau khi biết bác sĩ là ai + lịch confirmed | Thông tin bác sĩ, chuyên môn, rating | ⚠️ Giống timing, khác trust mechanism (xem ghi chú) |
| **Fiverr / Upwork** | Escrow (trả trước, giữ tiền) | Khi đặt order | Rating, review, portfolio | ❌ Cần cổng thanh toán + escrow |
| **Turnitin / Grammarly** | Pay-before-access | Trước khi dùng | Brand trust lâu năm | ❌ Nexus chưa có brand |
| **Dịch vụ luận văn VN** | Đặt cọc 30-50% | Chia 2 lần | Gặp trực tiếp / zalo | ❌ 2 lần manual = UX tệ |
| **Shopee/Lazada** | Pay-first, escrow-held | Khi đặt hàng | Review/rating + chính sách hoàn tiền | ❌ Cần escrow system |
| **ELSA / Topica** | Free trial limited → pay | Sau khi dùng thử | Trải nghiệm thực tế | ⚠️ Cần AI auto-preview |

**Ghi chú về doctor booking:** Doctor booking giống Nexus về **thời điểm thu tiền** (sau khi xác nhận tiếp nhận, trước khi bắt đầu chuyên môn) nhưng **khác về cơ chế tạo niềm tin**. Doctor booking cho user biết *ai* sẽ phục vụ (tên bác sĩ, chuyên môn, rating) — Nexus thì không, vì supporter chỉ được assign sau khi paid. Trust signal thật sự của Nexus là "có người đã đọc case và xác nhận tiếp nhận" — gần với consulting firm hơn là doctor booking.

### Pattern chung từ dịch vụ thành công

Mọi dịch vụ thành công, đặc biệt startup mới, đều tuân theo **4 nguyên tắc**:

1. **Cho user thấy GIÁ TRỊ trước khi yêu cầu tiền** — dù là buổi tư vấn sơ bộ, free trial, hay thông tin về người sẽ phục vụ.
2. **Payment gate đặt ngay TRƯỚC khi bắt đầu công việc chuyên môn** — không trước, không sau.
3. **Cam kết rõ ràng** về những gì sẽ nhận được sau khi trả tiền.
4. **Chính sách bảo vệ** (hoàn tiền, dispute) nếu kết quả không như cam kết.

Nexus áp dụng pattern này thông qua mô hình consulting firm: **triage sơ bộ miễn phí** đóng vai trò "buổi tư vấn" — chứng minh Nexus có người thật đọc case, xác nhận scope, và cam kết tiếp nhận. Đây là trust signal đủ mạnh cho mức giá package thấp (50-200k), dù user không biết cụ thể ai sẽ xử lý.

---

## 2. Đề Xuất: Mô Hình "Triage-then-Pay"

> **User trả tiền lúc nào?** Ngay sau khi Nexus xác nhận tiếp nhận case (triage accept) VÀ user đã xác nhận package/giá.
>
> **Vì sao đúng lúc đó?** Vì user đã nhận được trust signal (case được nhận, package/giá rõ ràng, biết mình đang trả tiền cho gì), và Nexus chưa bỏ chi phí chuyên môn nào. Tương tự cách consulting firms nhỏ hoạt động: tư vấn sơ bộ miễn phí → xác nhận scope và báo giá → khách đồng ý → trả tiền → bắt đầu làm.

### Workflow

```
User submit case (chọn package ban đầu)
    ↓
[TRIAGE SƠ BỘ - MIỄN PHÍ]
Admin/Senior supporter đọc qua case:
- Case có đủ thông tin không?
- Case có thuộc scope Nexus hỗ trợ không?
- Package user chọn có phù hợp không? Nếu cần đổi → đề xuất package khác.
- Kết quả: ACCEPT hoặc REJECT
    ↓
Nếu REJECT → Thông báo user lý do. Không yêu cầu payment. Kết thúc.
    ↓
Nếu ACCEPT:
- Thông báo user: case được tiếp nhận
- Hiển thị package + giá xác nhận (nếu khác với lúc submit → ghi rõ lý do đổi)
- User XÁC NHẬN package/giá → Case vào trạng thái `awaiting_payment`
- User thấy: thông tin chuyển khoản, số tiền, nội dung CK, thời hạn 48-72h
- User chuyển khoản + upload proof
    ↓
[ADMIN VERIFY PAYMENT]
- Admin kiểm tra proof
- Nếu hợp lệ: payment_status = `paid`, case tự động vào `under_review`
- Nếu không hợp lệ: payment_status = `rejected`, user được upload lại
    ↓
[REVIEW CHUYÊN MÔN - CHỈ SAU PAID]
- Assign supporter
- Supporter bắt đầu làm việc thật
- Tạo deliverable (báo cáo phản biện)
```

### Vì sao mô hình này tốt nhất cho Nexus startup?

**Trust cho User:**

- User **BIẾT** case được nhận TRƯỚC khi bỏ tiền. Không có cảm giác "nộp tiền vào hố đen".
- User **XÁC NHẬN** package và giá trước khi thấy CTA thanh toán — không bị bất ngờ về số tiền.
- Triage sơ bộ = chứng minh Nexus có người thật đọc case, không phải scam.
- Tương tự consulting firm nhỏ: tư vấn sơ bộ miễn phí → báo giá rõ → khách đồng ý → trả tiền.

**An toàn cho Nexus:**

- Supporter **KHÔNG BẮT ĐẦU** làm việc cho đến khi paid → Zero risk làm không công.
- Triage sơ bộ là chi phí thấp (chỉ đọc overview, không phân tích sâu).
- Admin kiểm soát cả payment lẫn case flow.
- Một lần chuyển khoản = một lần verify = UX đơn giản.

**Phù hợp startup giai đoạn đầu:**

- Volume case thấp → admin/founder tự triage nhanh được.
- Scale lên → delegate triage cho senior supporter.
- Sẵn sàng upgrade lên cổng thanh toán (chỉ thay manual bằng auto, flow không đổi).
- Giá package thấp (50-200k) → barrier thanh toán 1 lần không lớn.

---

## 3. So Sánh 4 Phương Án

| Tiêu chí | Pay-at-Submit | Free-Preview | Deposit 2 lần | **Triage-then-Pay** |
|----------|:---:|:---:|:---:|:---:|
| Trust cho user | 🔴 Rất thấp | 🟢 Rất cao | 🟡 TB | **🟢 Cao** |
| An toàn cho Nexus | 🟢 Rất cao | 🔴 Rất thấp | 🟢 Cao | **🟢 Cao** |
| UX với manual payment | 🟢 Đơn giản | 🟢 Đơn giản | 🔴 Phức tạp | **🟢 Đơn giản** |
| Conversion dự kiến | 🔴 Thấp | 🟢 Cao | 🟡 TB | **🟢 TB-Cao** |
| Chi phí vận hành Nexus | 🟢 Thấp | 🔴 Cao | 🟡 TB | **🟢 Thấp** |
| **Tổng** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | **⭐⭐⭐⭐⭐** |

**Loại ngay:**

- **Pay-at-Submit**: User trả tiền khi chưa biết case có được nhận không → conversion chết với startup mới.
- **Free-Preview**: Supporter làm việc thật trước khi paid → Nexus chịu risk 100%.
- **Deposit 2 lần**: 2 lần chuyển khoản + 2 lần verify thủ công = UX kinh khủng với manual payment.

---

## 4. Trả Lời Từng Câu Hỏi Thiết Kế

### A. Triage trước payment

| Câu hỏi | Trả lời |
|---------|---------|
| Triage gồm gì? | Đọc overview case, xác định scope, xác định/xác nhận package, accept/reject |
| Ai triage? | Giai đoạn đầu: admin/founder. Scale: senior supporter |
| Được đọc tài liệu không? | Chỉ lướt qua để xác định khả thi. KHÔNG đọc sâu |
| Được đưa góp ý chuyên môn? | **KHÔNG.** Chỉ xác định khả năng tiếp nhận |
| Nếu triage đổi package so với lúc submit? | User nhận thông báo kèm lý do, phải **xác nhận lại** trước khi thấy CTA thanh toán |

### B. Điểm bắt đầu payment gate

| Câu hỏi | Trả lời |
|---------|---------|
| Payment CTA xuất hiện khi nào? | Sau khi triage accept **VÀ** user đã xác nhận package/giá |
| User thanh toán sớm hơn được không? | **KHÔNG.** Chưa biết case có được nhận hay không |
| Cần stage `awaiting_payment` riêng? | **CÓ.** Tách biệt rõ ràng |
| Nếu package/giá thay đổi so với submit? | User thấy rõ giá mới + lý do. Phải confirm trước khi CTA thanh toán hiện ra |

### C. Điểm bắt đầu xử lý chuyên môn

| Câu hỏi | Trả lời |
|---------|---------|
| "Bắt đầu làm việc thật" là gì? | Assign supporter, đọc tài liệu sâu, viết feedback |
| Assign supporter = commit tài nguyên? | **CÓ.** Chỉ sau paid |
| `under_review` chỉ mở sau `paid`? | **ĐÚNG.** Mốc tuyệt đối |
| Nghiệp vụ chuyên môn trước paid? | **KHÔNG CÓ** |

### D. Rule chống scam 2 chiều

| Phía | Cam kết |
|------|---------|
| **User cần thấy trước khi trả tiền** | Case được nhận, package/giá xác nhận, cam kết về deliverable, cam kết Nexus chỉ bắt đầu sau paid, chính sách hủy/hoàn rõ ràng |
| **Nexus cần trước khi giao case** | Payment verified bởi admin |
| **Payment reject** | User được upload lại proof |
| **Case hủy sau paid** | Xem chính sách refund 3 tầng (mục 6) |

### E. Package free

| Câu hỏi | Trả lời |
|---------|---------|
| Bỏ qua payment flow? | **CÓ** hoàn toàn |
| State nào? | `payment_status = not_required` |
| Vào review ngay sau triage? | **CÓ** |

---

## 5. State Design

### payment_status

| Status | Nghĩa | Ai trigger |
|--------|-------|-----------|
| `not_required` | Package free, không cần thanh toán | System (auto khi package = free) |
| `pending` | Đang chờ user thanh toán (user đã confirm package/giá) | System (auto khi user confirm package sau triage accept) |
| `proof_submitted` | User đã upload proof, chờ admin verify | User action |
| `paid` | Admin đã verify thành công | Admin action |
| `rejected` | Proof không hợp lệ, user có thể gửi lại | Admin action |
| `expired` | Hết hạn thanh toán (48-72h) | System (auto) |

### Gating Rules

```
CAN assign supporter?       → ONLY IF payment_status IN (paid, not_required)
CAN enter under_review?     → ONLY IF payment_status IN (paid, not_required)
CAN create deliverable?     → ONLY IF payment_status IN (paid, not_required)
CAN read documents deeply?  → ONLY IF payment_status IN (paid, not_required)
CAN upload proof?           → ONLY IF payment_status IN (pending, rejected)
CAN re-upload after reject? → YES
CAN submit new case?        → ONLY IF user has < 2 cases in (pending, proof_submitted) status
```

### State Mapping

| Case Stage | payment_status | User thấy (user_facing_stage) |
|-----------|----------------|-------------------------------|
| `submitted` | — | "Case đang được xem xét" |
| `triage_accepted` | *(chờ confirm package)* | "Case được tiếp nhận — Xác nhận gói dịch vụ" |
| `triage_accepted` | `pending` | "Đã xác nhận gói — Chờ thanh toán" |
| `triage_accepted` | `proof_submitted` | "Minh chứng đã gửi — Đang xác minh" |
| `triage_accepted` | `rejected` | "Minh chứng chưa hợp lệ — Vui lòng gửi lại" |
| `triage_accepted` | `expired` | "Hết hạn thanh toán" |
| `under_review` | `paid` | "Đang phản biện" |
| `under_review` | `not_required` | "Đang phản biện" |
| `triage_rejected` | — | "Case không được tiếp nhận" |

---

## 6. Rủi Ro & Giảm Thiểu

| # | Risk | Mô tả | Giảm thiểu |
|---|------|-------|------------|
| 1 | **Triage spam** | User submit nhiều case liên tục rồi không trả tiền case nào — tốn triage cost | **Giới hạn cứng:** mỗi user tối đa **1 case** ở trạng thái `awaiting_payment` (pending / proof_submitted) tại bất kỳ thời điểm nào. Muốn submit case mới → phải hoàn tất hoặc hủy case đang chờ. |
| 2 | **Triage chi phí ẩn** | Nexus tốn thời gian triage cho case cuối cùng không paid | Triage nhanh (15-30p max). Chỉ đọc overview, không phân tích sâu. Chi phí chấp nhận được để xây trust giai đoạn đầu. Kết hợp giới hạn spam ở trên để kiểm soát tổng lượng triage lãng phí. |
| 3 | **User kéo dài thanh toán** | Case chiếm slot nhưng user không chuyển khoản | Thời hạn 48-72h. Hết hạn → `expired`. Xem flow expired bên dưới. |
| 4 | **Admin verify chậm** | User chuyển khoản rồi chờ lâu | SLA nội bộ: verify trong 4h làm việc. UX hiển thị rõ thời gian chờ. |
| 5 | **Proof giả mạo** | User upload proof chỉnh sửa | Admin đối chiếu với số dư tài khoản Nexus. Volume thấp → kiểm tra kỹ. |
| 6 | **Tranh chấp sau paid** | User paid, muốn hủy hoặc đòi hoàn tiền | Chính sách refund 3 tầng — xem bên dưới. |
| 7 | **"Sao phải trả 100% trước?"** | User thấy trả 100% là quá nhiều | Framing: "thanh toán dịch vụ đã được xác nhận". Giá package thấp giảm barrier. Trust signal từ triage accept + package confirm. |
| 8 | **Package thay đổi sau triage** | User submit chọn package A, triage đề xuất package B (giá khác) | User phải **xác nhận lại** package/giá trước khi thấy CTA thanh toán. Không bao giờ hiện số tiền khác với kỳ vọng mà không có confirmation. |

### Flow cho case `expired`

| Thời điểm | Xử lý |
|-----------|-------|
| Expired **trong 7 ngày** | User có thể **tái kích hoạt** cửa sổ thanh toán (payment window reset 48-72h mới). Không cần re-triage. Admin không tốn thêm effort. |
| Expired **quá 7 ngày** | Case đóng vĩnh viễn. User muốn tiếp tục → phải **submit case mới** và đi qua triage lại từ đầu. Lý do: sau 7 ngày, thông tin case có thể đã thay đổi, triage cũ không còn chính xác. |

### Chính sách refund 3 tầng

| Giai đoạn | Hoàn tiền? | Ghi chú |
|-----------|-----------|---------|
| **Paid → chưa assign supporter** | ✅ Hoàn 100% | Nexus chưa bỏ chi phí chuyên môn nào. User có quyền hủy. Đây là khoảng an toàn nhất cho cả 2 phía. |
| **Supporter đã được assign → chưa gửi báo cáo** | ❌ Không hoàn | Nexus đã commit tài nguyên thật (thời gian supporter). Nói rõ điều này TRƯỚC khi user trả tiền. |
| **Báo cáo đã gửi** | ❌ Không hoàn | Deliverable đã được tạo và giao. Không có cơ sở hoàn tiền. |

**Lưu ý quan trọng:** Khoảng thời gian giữa "paid" và "assign supporter" thường rất ngắn (admin assign ngay sau khi verify payment). Nhưng vẫn cần chính sách rõ cho trường hợp user đổi ý trong khoảng này. Việc cho phép hoàn 100% ở giai đoạn này **tăng trust đáng kể** vì user biết: "nếu trả tiền rồi mà chưa ai bắt đầu làm, mình vẫn lấy lại được."

---

## 7. UX Copy

### Khi case được accept — bước xác nhận package (trước CTA thanh toán)

**Nếu package không đổi:**

> Case của bạn đã được Nexus tiếp nhận với gói dịch vụ **[tên package]** — **[giá]**.
>
> Xác nhận gói dịch vụ để tiếp tục thanh toán.

**Nếu package thay đổi so với lúc submit:**

> Case của bạn đã được Nexus tiếp nhận. Sau khi xem xét, chúng tôi đề xuất gói **[tên package mới]** — **[giá mới]** thay vì gói **[tên package cũ]** bạn đã chọn.
>
> Lý do: [lý do cụ thể — ví dụ: "case của bạn cần đánh giá sâu hơn về mô hình kinh doanh"].
>
> Xác nhận gói dịch vụ để tiếp tục thanh toán.

### Khi user đã confirm package — CTA thanh toán

> Để bắt đầu quá trình phản biện chuyên môn, vui lòng thanh toán theo thông tin bên dưới.
>
> Nexus chỉ bắt đầu xử lý sau khi xác nhận thanh toán thành công.
>
> **Chính sách hủy:** Bạn có thể hủy và nhận hoàn tiền 100% trước khi chuyên gia được phân công. Sau khi chuyên gia bắt đầu làm việc, Nexus không hoàn tiền.

### Khi proof đang chờ verify

> Minh chứng thanh toán của bạn đã được gửi. Chúng tôi sẽ xác minh trong vòng 4 giờ làm việc.

### Khi proof bị reject

> Minh chứng thanh toán chưa hợp lệ. Vui lòng kiểm tra lại số tiền, nội dung chuyển khoản, và gửi lại minh chứng mới.

### Khi paid thành công

> Thanh toán đã được xác nhận. Case của bạn đang được chuyển cho chuyên gia phản biện.

### Khi case bị reject (không tiếp nhận)

> Case của bạn chưa được tiếp nhận vì [lý do cụ thể]. Bạn có thể chỉnh sửa và gửi lại.

### Khi case hết hạn thanh toán (trong 7 ngày)

> Thời hạn thanh toán cho case này đã hết. Bạn có thể kích hoạt lại cửa sổ thanh toán mà không cần gửi lại case.

### Khi case hết hạn thanh toán (quá 7 ngày)

> Case này đã đóng do quá thời hạn thanh toán. Nếu bạn vẫn cần hỗ trợ, vui lòng gửi case mới.

---

## 8. Tóm Tắt Quyết Định

**Câu trả lời cuối cùng:** User trả tiền **ngay sau khi Nexus xác nhận tiếp nhận case (triage accept) VÀ user đã xác nhận package/giá**, vì đó là thời điểm user đã có đầy đủ trust signal: case được nhận, giá rõ ràng, biết rõ mình đang trả tiền cho gì, và có chính sách hủy/hoàn rõ ràng. Nexus chưa bỏ chi phí chuyên môn nào tại thời điểm này.

Mô hình này tương tự cách **consulting firms nhỏ** hoạt động: tư vấn sơ bộ miễn phí → xác nhận scope + báo giá → khách đồng ý → trả tiền → bắt đầu làm.

### Scalability path

```
Hiện tại (MVP):     Manual transfer → Upload proof → Admin verify
Giai đoạn 2:        Tích hợp bank API → Auto reconciliation
Giai đoạn 3:        Cổng thanh toán (VNPay/Stripe) → Instant confirm
Giai đoạn 4:        Escrow + refund policy phức tạp hơn nếu cần
```

Flow Triage-then-Pay **không cần thay đổi** khi upgrade từ manual lên auto. Chỉ bước "chuyển khoản + verify" được thay thế, toàn bộ logic gating giữ nguyên.
