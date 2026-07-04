# Demo Script & Verification Report (Phase 04)

## 1. Dữ liệu Hồ sơ Demo Mẫu (Synthetic-Realistic)
- **Gói dịch vụ**: Gói Tiêu chuẩn (250,000 VND)
- **Tình huống/Vấn đề**: Nhóm đã làm xong bản thảo báo cáo dự án khởi nghiệp nhưng bị giảng viên đánh giá là "chưa có điểm nhấn ở phần Financial Plan". Nhóm cần feedback sâu hơn về các giả định tài chính để chuẩn bị cho buổi Pitching bảo vệ cuối kỳ.
- **Nhu cầu hỗ trợ chính**: Tư vấn logic cấu trúc / luồng trình bày, Kiểm tra & tối ưu nội dung cụ thể (Tài chính).
- **Kết quả mong đợi**: "Bản báo cáo chỉ ra các lỗ hổng logic trong file Excel dòng tiền và gợi ý cách trình bày slide Financial mượt mà hơn."
- **Tài liệu minh chứng**:
  - `Link Google Drive`: https://drive.google.com/...
  - `Loại`: Slide Pitch Deck + Excel File
- **Đề tài**: Nền tảng kết nối gia sư và học sinh "TutorNexus"
- **Thời hạn**: Gấp (trong 48h)

## 2. Kịch bản Walkthrough (Demo Script)

**[30 giây đầu] Mở đầu & Khởi tạo (Student Dashboard)**
- *Presenter*: "Xin chào các bạn. Hôm nay chúng ta sẽ demo một luồng hoàn chỉnh trên Nexus - nền tảng kết nối sinh viên và mentor. Sinh viên vào Dashboard, ấn tạo 'Hồ sơ phản biện' mới."
- *Thao tác*: Click nút "Tạo Hồ sơ Mới". Trợ lý Chat Intake hiện ra.
- *Presenter*: "Nhóm sinh viên nhập bối cảnh, cung cấp link Drive, và nói rõ nhu cầu hỗ trợ. Nhờ việc phân loại rõ ràng (Vấn đề -> Hỗ trợ cần -> Bằng chứng -> Kết quả), Supporter sẽ hiểu ngay nhóm đang cần gì."

**[Phút 1:00] Hoàn thành Khởi tạo & Xem Workspace (Student Workspace)**
- *Presenter*: "Hồ sơ được nộp. Ở giao diện Workspace của sinh viên, ta thấy ngay trạng thái là 'Chờ thanh toán' hoặc 'Chờ Admin phân công'. Mọi thứ đều gọi là 'Hồ sơ', rất nhất quán. Phía bên phải là tab Discussion và Timeline, giúp sinh viên biết hồ sơ đang đi tới đâu."

**[Phút 1:30] Phân công (Admin Dashboard)**
- *Presenter*: "Đóng vai Admin. Admin vào bảng 'Chỉ định Supporter phụ trách đánh giá và sửa đổi bản thảo phản biện cho hồ sơ mới'. Nhấn xem chi tiết, Admin hiểu ngay hoàn cảnh và chọn Supporter phù hợp để gán (Assign)."
- *Thao tác*: Click "Phân công" trong danh sách.

**[Phút 2:00] Phản biện (Supporter Workspace)**
- *Presenter*: "Chuyển sang màn hình Supporter. Supporter mở 'Hồ sơ' này lên. Họ thấy ngay nút 'Biên tập Báo cáo Phản biện'. Sau khi xem file Drive, Supporter viết các finding (phát hiện) và nộp lại hệ thống."

**[Phút 2:30] Nghiệm thu (Student Workspace)**
- *Presenter*: "Quay lại màn hình sinh viên. Trạng thái đã chuyển sang 'Đã có báo cáo'. Sinh viên có thể chat trong tab Discussion để hỏi thêm Supporter. Hành trình tạo, phân công và phản biện kết thúc mượt mà."

## 3. Checklist Verification & UX Regression
- [x] **Student Intake**: Flow mượt, các bước sắp xếp logic (Vấn đề -> Hỗ trợ cần -> Tài liệu -> Kết quả mong muốn). Wording đồng nhất là "Hồ sơ" và "Đề tài".
- [x] **Customer Status**: Các trạng thái "Đang phản biện", "Cần làm rõ" đều dùng đúng terminology ở frontend.
- [x] **Chat/Timeline**: Đã render đúng text (Mã hồ sơ, Hồ sơ của tôi). Trực quan làm kênh giao tiếp chính.
- [x] **Admin/Supporter Handoff**: Modal assign không còn chữ "case", bảng trống hiển thị "Không có hồ sơ nào". Continuity tốt.

*Mọi issues còn sót về wording (case, dự án) đã được resolve qua các lệnh global search.*
