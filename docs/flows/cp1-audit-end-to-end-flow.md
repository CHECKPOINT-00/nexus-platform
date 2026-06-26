# Flow audit CP1 end-to-end

- PRD reference: [`../prd/core-product-prd.md`](../prd/core-product-prd.md)
- Related flows:
  - [`./intake-flow.md`](./intake-flow.md)
  - [`./admin-triage-and-assignment-flow.md`](./admin-triage-and-assignment-flow.md)
  - [`./case-lifecycle-flow.md`](./case-lifecycle-flow.md)
- Trạng thái: đang làm việc

## Mục tiêu

Mô tả trọn journey từ lúc khách vào web đến lúc nhận report, gửi bản sửa, và nhận review vòng tiếp theo.

## Quyết định thiết kế chính

- Không làm chat thật ở MVP.
- Dùng wizard có cảm giác đối thoại cho bước tạo case.
- Dùng case workspace làm trung tâm xem report, tài liệu, và lịch sử vòng review.
- Report luôn được publish vào case rồi mới thông báo cho khách vào xem.
- Một case có nhiều round, không tạo case mới cho mỗi vòng sửa.

## Journey 1: Khách mới vào web

### Màn hình 1: Landing

**Mục tiêu**
- làm user hiểu Nexus giúp gì
- kéo user vào CTA

**Khối nội dung chính**
- value proposition
- các tình huống thường gặp
- flow hoạt động ngắn gọn
- ranh giới hỗ trợ
- CTA chính

**Nút**
- `Bắt đầu gửi case`
- `Đăng nhập`

### Màn hình 2: Đăng ký tài khoản

**Field**
- họ tên
- email
- mật khẩu
- checkbox đồng ý điều khoản

**Nút**
- `Tạo tài khoản`
- `Đã có tài khoản? Đăng nhập`

## Journey 2: Tạo case

### Màn hình 3: Dashboard rỗng

**Nội dung**
- empty state
- mô tả ngắn `Bạn chưa có case nào`

**Nút**
- `Tạo case mới`

### Màn hình 4-12: Create case wizard

Tham chiếu chi tiết ở [`./intake-flow.md`](./intake-flow.md).

**CTA cố định**
- `Quay lại`
- `Tiếp tục`
- `Lưu nháp`
- bước cuối: `Gửi case`

### Màn hình 13: Case submitted success

**Nội dung**
- thông báo thành công
- case id
- trạng thái `Đang chờ Nexus xem xét`
- hướng dẫn bước tiếp theo

**Nút**
- `Vào workspace của case`
- `Tạo case khác`

## Journey 3: Admin triage

### Màn hình 14: Admin queue

**Mục tiêu**
- scan nhanh case mới và độ gấp

**Nút theo mỗi case**
- `Xem chi tiết`

### Màn hình 15: Admin case detail

**Khối UI**
- summary case
- preview tài liệu
- timeline
- panel quyết định

**Nút**
- `Accept case`
- `Reject case`
- `Yêu cầu bổ sung`
- `Assign supporter`

## Journey 4: Supporter audit round 1

### Màn hình 16: Supporter queue

**Nội dung**
- danh sách case đã assign
- filter theo deadline, round, trạng thái

**Nút**
- `Mở case`

### Màn hình 17: Supporter case detail

**Cột trái**
- summary case
- checklist audit

**Cột giữa**
- document board
- preview tài liệu

**Cột phải**
- internal notes
- draft area
- action panel

**Nút**
- `Yêu cầu bổ sung`
- `Lưu nháp report`
- `Publish report`
- `Đóng case với lý do`

### Màn hình 18: User xem report

**Nội dung**
- report mới nhất nổi bật
- lỗi chính
- phần cần sửa trước
- câu hỏi bắt buộc cần làm rõ
- hướng sửa đề xuất

**Nút**
- `Tải report`
- `Gửi bản sửa mới`

## Journey 5: Revision round

### Màn hình 19: Submit revision

**Field**
- upload bản sửa
- note `Bạn đã sửa những gì?`

**Nút**
- `Gửi bản sửa`
- `Hủy`

### Màn hình 20: Supporter review round 2+

**Khác round 1 ở chỗ**
- phải so sánh bản cũ và bản mới
- phải hiểu user nói đã sửa phần nào
- report mới phải gắn rõ với round mới

**Nút**
- `Mở bản trước`
- `Mở bản mới`
- `Publish report mới`

## Kết luận flow phase 1

Flow hợp lý nhất hiện tại là:
- landing
- auth
- create case wizard
- case workspace chờ triage
- admin accept/reject/assign
- supporter audit và publish report vào case
- user xem report trong case
- user gửi revision trong cùng case
- supporter review round tiếp theo

Đây là flow đủ chặt để build MVP và đủ rõ để demo thuyết trình.
