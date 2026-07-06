# Brainstorm: Gói kèm thêm (Add-ons) & Trải nghiệm Đóng Case

## 1. Vấn đề hiện tại (từ Note & Codebase)

### 1A. Flow đóng case hiện tại quá "cứng" (Hard Close)
- Codebase check: Hành động "Đóng case" (`close-case.usecase.ts`) chuyển trạng thái thành `closed`.
- Lúc này, API gửi tin nhắn lập tức bị chặn (do check `isFinalCaseStage`).
- **Nỗi đau**: User mua Gói 1 (gửi 1 tài liệu, nhận 1 báo cáo). Nhận báo cáo xong bị đóng case ngay lập tức -> User có thắc mắc nhỏ không thể hỏi, cảm giác "hụt hẫng", dịch vụ lạnh lùng.

### 1B. Xung đột lợi ích (Chat buffer)
- Nếu mở thêm thời gian chat (VD: 1-2 ngày) sau khi gửi báo cáo: User hài lòng hơn.
- NHƯNG: Supporter bị "cực thêm", có rủi ro user lợi dụng để nhờ xem thêm tài liệu mới ngoài scope của gói.

### 1C. Thiếu cơ chế Feedback/Rating
- DB hoàn toàn chưa có bảng hay schema nào lưu trữ đánh giá sao (Rating) hay phản hồi của user cho supporter.
- Mục tiêu: User đánh giá báo cáo dựa trên một "checklist" (yêu cầu ban đầu đã được giải quyết chưa?), giúp platform đo lường chất lượng.

### 1D. Hoàn toàn chưa có "Gói kèm thêm" (Add-ons)
- System chỉ có `ServicePackage` (gói lớn). Chưa có khái niệm mua lẻ dịch vụ (Extra revision, Extra chat time, 1:1 call).

---

## 2. Giải pháp Đề xuất

Để giải quyết mâu thuẫn giữa "User hụt hẫng" và "Supporter cực thêm", chúng ta cần tách quá trình đóng case làm 2 pha (Soft Close và Hard Close), kết hợp với cơ chế Add-ons.

### Giải pháp 2A: Soft Close & Rating Phase (Giai đoạn chuyển tiếp)

Thay vì Supporter đóng case và khóa chat lập tức, flow mới sẽ như sau:

1. **Supporter gửi báo cáo cuối cùng** -> Hệ thống chuyển case sang trạng thái mới: `waiting_for_user_rating` (Soft Close).
2. **Kích hoạt đồng hồ đếm ngược (SLA) 24 giờ**:
   - Trong 24h này: Khung chat VẪN MỞ.
   - User có thể chat để **hỏi đáp làm rõ (Clarification)** về báo cáo vừa nhận.
   - Giao diện chat có cảnh báo rõ ràng: *"Đang trong thời gian làm rõ (Còn X giờ). Chỉ hỗ trợ giải đáp báo cáo, không nhận tài liệu mới"*.
3. **Trigger Rating Checklist**:
   - Giao diện yêu cầu User chấm điểm báo cáo (1-5 sao) và check vào các yêu cầu ban đầu (VD: [x] Đã đánh giá target audience, [ ] Đã gợi ý model doanh thu).
4. **Hard Close (Khóa vĩnh viễn)**:
   - Xảy ra khi: (1) User submit Rating, HOẶC (2) Hết hạn 24 giờ.
   - Trạng thái chuyển thành `closed`. Chat bị khóa cứng.

| Pro | Con |
|-----|-----|
| Xóa cảm giác "đem con bỏ chợ" của Gói 1 | Supporter vẫn phải canh tin nhắn thêm 24h |
| Thu thập được đánh giá chất lượng thực tế | Cần code thêm trạng thái và cronjob tự động đóng sau 24h |

### Giải pháp 2B: Kiến trúc Gói Kèm Thêm (Add-ons)

Khi case đã Hard Close (hoặc sắp hết hạn), user muốn thêm dịch vụ thì phải **Mua Add-on**.
Bán lẻ dịch vụ (a la carte) giúp tăng doanh thu LTV (Life-time Value) mà không làm phức tạp gói ban đầu.

**Các loại Add-ons tiềm năng:**
1. ⏱️ **Gia hạn Chat (Chat Extension)**: +48 giờ chat với supporter.
2. 🔄 **Thêm vòng phản biện (Extra Revision)**: Nộp lại 1 bản sửa để supporter chấm lại (dành cho Gói 1 muốn nâng cấp).
3. 📞 **Tư vấn 1:1 (Meeting)**: Book 30 phút Google Meet với supporter.

**Workflow Add-on:**
1. Nút "Mua gói kèm thêm" xuất hiện nổi bật khi case ở giai đoạn `report_ready` hoặc `closed`.
2. User chọn Add-on -> Tạo `Payment` y hệt mua gói chính.
3. Payment success -> Trigger webhook cập nhật Case:
   - Nếu mua Chat Extension: Hồi sinh case từ `closed` -> `under_review`, update deadline.
   - Nếu mua Extra Revision: Thêm 1 slot revision vào db, đổi trạng thái thành `waiting_for_revision`.

---

## 3. Impact & Schema Changes (Dự kiến)

**DB Schema (Chưa chạy, chỉ phân tích):**
- Thêm model `CaseRating`: Lưu số sao, checklist đã hoàn thành, feedback text.
- Thêm model `AddonCatalog`: Danh mục gói lẻ (Giá, Loại gói).
- Thêm model `CaseAddon`: Ghi nhận case nào mua addon gì, đã sử dụng chưa.

**Frontend:**
- Modal Rating bắt buộc trước khi đóng case.
- Store mua Addon trong tab "Thanh toán" hoặc banner cuối case.

---

## 4. Quyết định đã chốt (Decisions)

1. **Thời gian Soft Close**: 24 giờ. Vừa đủ để user hỏi đáp làm rõ báo cáo.
2. **Policy Chat buffer**: Mở chat bình thường (hiện tại platform chat chỉ hỗ trợ text nên không lo user upload tài liệu mới).
3. **Rating bắt buộc**: Bắt buộc. Nếu user không rate, sau 24h tự động đóng case và MẶC ĐỊNH tính là 5 Sao cho Supporter.
4. **Loại Add-ons Phase 1**: Tập trung làm tính năng mua thêm "Thêm vòng phản biện (Extra revision)".
5. **Quyền của Supporter**: Auto-accept. User thanh toán thành công là tự động kích hoạt Add-on cho Supporter hiện tại xử lý tiếp (đảm bảo luồng tiền liền mạch).
