# Payment Timing, Trust Model, and Workflow Gate Problem

---

**Created:** 2026-07-04  
**Owner:** Nexus Product  
**Status:** Open — chưa có quyết định  
**Version:** 1.1

---

## Problem Statement

> Nexus chưa xác định được **thời điểm chính xác** trong workflow case mà user phải thanh toán — sớm quá thì user mất niềm tin và không chuyển đổi, muộn quá thì Nexus và supporter chịu rủi ro làm việc mà không được trả tiền.

---

## Context / Background

Nexus platform đang có flow payment **manual-only**:

- User chuyển khoản ngoài hệ thống.
- User tải ảnh/PDF minh chứng thanh toán.
- Admin mở minh chứng và duyệt thủ công.
- Không có OCR, bank webhook, auto reconciliation, hay cổng thanh toán tích hợp.

Code/logic hiện tại đã có phần upload proof và admin verify payment, nhưng bài toán khó hơn không nằm ở API upload hay nút duyệt. Điểm khó thật sự là:

> **User nên thanh toán vào thời điểm nào trong workflow case để vừa tạo cảm giác an tâm cho user, vừa bảo vệ Nexus khỏi rủi ro làm việc mà không được trả tiền?**

---

## Stakeholders Bị Ảnh Hưởng

| Stakeholder                | Ảnh hưởng                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **User (student/startup)** | Quyết định có thanh toán hay không dựa vào mức độ tin tưởng vào thời điểm được yêu cầu        |
| **Supporter**              | Có thể bị assign và bắt đầu làm việc trước khi case được đảm bảo thanh toán                   |
| **Admin**                  | Phải xử lý manually cả triage lẫn payment verification — thứ tự và rule chưa rõ               |
| **Nexus (ops)**            | Chịu rủi ro tranh chấp nếu ranh giới giữa dịch vụ miễn phí và có phí không được định nghĩa rõ |

---

## Vấn Đề Cốt Lõi

Đây là bài toán **tension** giữa quyền lợi hai bên:

- **User sợ bị scam / trả tiền quá sớm**: nộp tiền trước nhưng case không được nhận, supporter không phù hợp, hoặc chất lượng dịch vụ không như kỳ vọng.
- **Nexus sợ bị scam / làm việc không công**: supporter bắt đầu xử lý chuyên môn, tạo deliverable, nhưng user không thanh toán hoặc rời đi.

Nếu payment bị đặt **quá sớm** trong flow:

- User phải trả tiền trước khi biết case có thật sự được nhận hay không.
- User thấy rủi ro cao và niềm tin thấp.
- Conversion có thể giảm mạnh.

Nếu payment bị đặt **quá muộn** trong flow:

- Nexus phải bỏ công triage sâu hoặc thậm chí bắt đầu review trước khi nhận tiền.
- Supporter có thể làm việc thật nhưng vẫn chưa có cam kết tài chính từ user.
- Rủi ro vận hành và tranh chấp tăng.

Vì vậy, vấn đề không chỉ là `payment_status`, mà là **điểm chèn payment vào case workflow**.

---

## Impact Nếu Không Giải

### Lỗi 1 — User mất niềm tin

Biểu hiện:

- Bị yêu cầu thanh toán quá sớm.
- Không hiểu mình đang trả tiền cho điều gì.
- Không có cam kết rõ là case đã được Nexus nhận.

Hậu quả: drop-off tại bước payment, conversion thấp, user không quay lại.

### Lỗi 2 — Nexus chịu rủi ro vận hành

Biểu hiện:

- Supporter bắt đầu làm việc thật khi case chưa paid.
- Case đã được assign, đã vào `under_review`, nhưng payment chưa xác nhận.
- Deliverable bắt đầu được tạo trước khi khóa nghĩa vụ thanh toán.

Hậu quả: tranh chấp, supporter không được đền bù, Nexus không có cơ sở từ chối hoàn tiền.

---

## Constraints / Ràng Buộc Cứng

Những ràng buộc này **không được phép vượt qua** khi đưa ra giải pháp:

1. Payment hiện tại là **manual-only** — không có cổng thanh toán tích hợp, không có VNPay/Stripe/MoMo.
2. Admin phải **duyệt thủ công** mọi minh chứng thanh toán.
3. Không có bank webhook hay auto reconciliation trong scope hiện tại.
4. Hệ thống đang có sẵn `payment_status` và logic upload proof — không được thiết kế lại từ đầu, chỉ xác định rule gating.

---

## Scope

### Trong phạm vi

- Xác định **thời điểm chính xác** trong workflow case để trigger payment gate.
- Xác định **ranh giới** giữa triage sơ bộ (miễn phí) và xử lý chuyên môn thật (cần paid).
- Xác định **những action nào bị chặn** khi chưa paid.
- Xác định **state design**: `payment_status`, `awaiting_payment`, state transitions.
- Xác định **xử lý package free**.
- Xác định **UX copy / communication** cho từng trạng thái payment.

### Ngoài phạm vi

- Tích hợp cổng thanh toán (VNPay, Stripe, v.v.).
- Auto reconciliation hay OCR minh chứng.
- Thiết kế lại toàn bộ case workflow ngoài phần payment gate.
- Escrow hay refund policy phức tạp.

---

## Điều Đang Cần Quyết Định

Cần chốt rõ:

1. **Giai đoạn nào của case được coi là "đủ điều kiện để yêu cầu thanh toán"?**
2. **Trước khi paid, Nexus được phép làm đến mức nào?**
3. **Sau khi paid, giai đoạn nào mới được bắt đầu xử lý chuyên môn thật?**
4. **Trường hợp case bị từ chối tiếp nhận thì payment có bao giờ được yêu cầu không?**
5. **Trường hợp package free thì có bỏ qua hoàn toàn payment gate không?**

---

## Câu Hỏi Thiết Kế Nghiệp Vụ

### A. Triage trước payment

- Triage sơ bộ miễn phí sẽ bao gồm những gì?
- Ai có quyền triage sơ bộ: admin, senior supporter, hay cả supporter thường?
- Triage sơ bộ có được phép đọc tài liệu và đánh giá mức độ phù hợp không?
- Triage sơ bộ có được phép đưa góp ý chuyên môn không, hay chỉ xác định khả năng tiếp nhận?

### B. Điểm bắt đầu payment gate

- Payment CTA nên xuất hiện ở giai đoạn nào?
- User có được phép thanh toán ngay từ lúc vừa submit case không?
- Nếu user thanh toán sớm hơn thời điểm mong muốn, hệ thống có chấp nhận không?
- Có cần stage riêng như `awaiting_payment` để tránh nhập nhằng không?

### C. Điểm bắt đầu xử lý chuyên môn

- Hành động nào được coi là "bắt đầu làm việc thật"?
- Assign supporter có được xem là commit tài nguyên thật không?
- `under_review` có phải mốc tuyệt đối chỉ được mở sau `paid` không?
- Có bất kỳ nghiệp vụ chuyên môn nào được phép diễn ra trước `paid` không?

### D. Rule chống scam 2 chiều

- User cần nhìn thấy cam kết gì từ Nexus trước khi được yêu cầu thanh toán?
- Nexus cần điều kiện gì để yên tâm giao case cho supporter?
- Nếu payment bị reject, user có được upload lại không?
- Nếu payment được duyệt nhưng sau đó case bị hủy, chính sách xử lý là gì?

### E. Package free

- Package free có bỏ qua toàn bộ payment flow không?
- Package free có cần state `not_required` hay chỉ auto coi như `paid`?
- Package free có vào review ngay sau triage accept không?

---

## Kết Quả Mong Muốn Khi Quay Lại Implement

Khi vấn đề này được giải quyết và quay lại code, cần có đầu ra rõ ràng:

- Chốt **thời điểm yêu cầu thanh toán**.
- Chốt **ranh giới giữa triage sơ bộ và xử lý chuyên môn**.
- Chốt **những action nào bị chặn khi chưa paid**.
- Chốt **mapping giữa case stage và payment status**.
- Chốt **copy/UX message** để user hiểu vì sao họ đang được yêu cầu thanh toán.
- Chốt **xử lý package free**.

---

## Checklist Nghiệm Thu

### 1. Context và trust model

- [ ] Đã thống nhất rõ user đang sợ điều gì nếu bị yêu cầu thanh toán quá sớm.
- [ ] Đã thống nhất rõ Nexus đang sợ điều gì nếu cho workflow đi quá xa trước khi thanh toán.
- [ ] Đã xác định rõ nguyên tắc cân bằng quyền lợi hai bên.

### 2. Payment timing

- [ ] Đã chốt chính xác **thời điểm user được yêu cầu thanh toán**.
- [ ] Đã chốt user có được phép thanh toán trước thời điểm đó hay không.
- [ ] Đã chốt payment CTA xuất hiện ở stage nào.

### 3. Triage vs chuyên môn

- [ ] Đã định nghĩa rõ "triage sơ bộ" gồm những gì.
- [ ] Đã định nghĩa rõ "xử lý chuyên môn" bắt đầu từ đâu.
- [ ] Đã chốt hành động nào được phép trước payment.
- [ ] Đã chốt hành động nào bị cấm trước payment.

### 4. Workflow gating

- [ ] Đã chốt rõ case **chưa paid** có được assign supporter hay không.
- [ ] Đã chốt rõ case **chưa paid** có được vào `under_review` hay không.
- [ ] Đã chốt rõ case **chưa paid** có được tạo deliverable/chuyên môn hay không.
- [ ] Đã chốt rõ case **paid** thì workflow mở ra ở mốc nào.

### 5. State design

- [ ] Đã chốt danh sách `payment_status` cuối cùng.
- [ ] Đã chốt có cần stage `awaiting_payment` hay không.
- [ ] Đã chốt mapping giữa `payment_status`, `user_facing_stage`, và `internal_status`.
- [ ] Đã chốt reject payment sẽ đưa case về state nào.

### 6. Exception cases

- [ ] Đã chốt flow cho package free.
- [ ] Đã chốt flow khi admin reject payment proof.
- [ ] Đã chốt user có được upload lại proof sau reject không.
- [ ] Đã chốt flow nếu case không được tiếp nhận sau triage.

### 7. UX / policy / communication

- [ ] Đã có câu chữ rõ ràng để giải thích vì sao user phải thanh toán ở thời điểm đó.
- [ ] Đã có câu chữ rõ ràng để giải thích khi payment đang chờ xác minh.
- [ ] Đã có câu chữ rõ ràng để giải thích khi payment bị từ chối.
- [ ] Đã có câu chữ rõ ràng để cam kết Nexus chỉ bắt đầu xử lý chuyên môn sau khi payment hợp lệ.

### 8. Ready for implementation

- [ ] Có decision cuối cùng bằng văn bản, không còn mơ hồ giữa nhiều phương án.
- [ ] Có bảng transition hoặc rule đủ rõ để backend implement.
- [ ] Có mapping đủ rõ để frontend hiển thị đúng CTA và guidance.
- [ ] Có thể trả lời ngắn gọn câu này: **"User trả tiền lúc nào, và vì sao đúng lúc đó?"**
