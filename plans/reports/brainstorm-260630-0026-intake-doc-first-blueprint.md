# Blueprint — Intake ưu tiên tài liệu, giảm tải nhận thức

## Vấn đề
Intake hiện tại bắt người dùng viết lại nhiều nội dung đã có sẵn trong bộ tài liệu startup. Việc này gây trùng lặp, tăng tải nhận thức, và đi ngược bối cảnh thật của người dùng: đang bí, mệt, gần deadline.

Ngoài ra, hệ thống không nên cố đánh giá chất lượng tài liệu ngay lúc người dùng đang dán URL Drive bằng cách gọi Google API hoặc LLM theo thời gian thực. Cách đó đắt, dễ bị spam, khó rate limit hợp lý và tạo lỗ hổng thiết kế ở ngay bước nhập liệu.

## Quyết định
Chuyển intake từ `viết lại toàn bộ ý tưởng` sang `đính kèm bộ hồ sơ + nói rõ đang cần hỗ trợ gì lúc này`.

Với nhóm chưa có tài liệu hoặc chưa biết viết thế nào, không dùng auto-check realtime. Thay vào đó, đặt một khối hướng dẫn cố định ngay trên phần nhập URL Drive, cho phép người dùng tự chọn cách lấy mẫu có sẵn.

## Nguyên tắc cốt lõi
- Tài liệu = nguồn sự thật cho bối cảnh nền
- Intake = nguồn sự thật cho điểm nghẽn hiện tại
- Supporter cần toàn bộ hồ sơ + một brief vận hành ngắn gọn
- Không dùng Google API + LLM realtime để phán chất lượng hồ sơ tại field input
- Hướng dẫn cứu hộ phải xuất hiện đúng lúc user cần dán tài liệu

## Kết quả mục tiêu
Nếu nhóm đã có tài liệu sẵn, người dùng có thể hoàn thành intake trong 2–4 phút.

Nếu nhóm chưa có tài liệu, người dùng hiểu ngay phải làm gì tiếp theo mà không cần submit xong mới bị yêu cầu bổ sung.

## Điều không làm trong blueprint này
- Không thiết kế lại sâu backend workflow
- Không yêu cầu OCR / parsing phải hoàn hảo ở phiên bản đầu
- Không chặn submit nếu AI trích xuất tài liệu thất bại
- Không gọi Google Drive API hoặc LLM mỗi lần người dùng dán / sửa URL
- Không xây dựng cơ chế auto-score chất lượng hồ sơ trong field input ở v1

## Mô hình intake mới

### Bước 1 — Hồ sơ nguồn
Bắt buộc:
- Link Google Drive / Google Docs
- Checklist loại tài liệu
- Xác nhận đã cấp quyền truy cập

Hỗ trợ thêm ngay trong bước này:
- Hiển thị alert cố định ngay trên phần nhập URL Drive
- Alert này dành cho nhóm chưa có hồ sơ hoặc hồ sơ còn quá mơ hồ
- Trong alert có một select 2 lựa chọn để lấy mẫu

Mục tiêu:
- Thu bộ tài liệu nguồn một lần
- Không bắt người dùng viết lại proposal
- Nếu chưa có tài liệu thì cứu họ ngay tại chỗ, không đẩy lỗi xuống cuối flow

### Bước 2 — Nhóm đang kẹt ở đâu?
Bắt buộc:
- Nhu cầu hỗ trợ chính
- Điểm nghẽn hiện tại (1–3 câu)
- Deadline / checkpoint

Tùy chọn:
- Phản hồi từ giảng viên
- Ghi chú thêm

Mục tiêu:
- Thu đúng nỗi đau hiện tại, không thu lại toàn bộ câu chuyện startup

### Bước 3 — Liên hệ & điều phối
Bắt buộc:
- Tên người đại diện
- Zalo hoặc email

Tùy chọn / có điều kiện:
- Trường
- Bối cảnh môn học
- Số nhóm
- Tên đề tài

Quy tắc:
Nếu sau này hệ thống trích xuất được các thông tin này từ tài liệu, có thể prefill và cho người dùng chỉnh lại.

### Bước 4 — Xác nhận & gửi
Hiển thị:
- Tài liệu đã đính kèm
- Nhu cầu hiện tại
- Thông tin liên hệ
- Deadline
- Các xác nhận boundary

Mục tiêu:
- Màn review phải đọc như một gói bàn giao dịch vụ, không phải dump form thô

## Chính sách field

### Bỏ khỏi luồng bắt buộc
Đây là các field gây trùng lặp lớn nhất với tài liệu nguồn:
- `case_summary`
- `current_situations`
- toàn bộ phần viết dài về ý tưởng / vấn đề / bối cảnh

### Giữ bắt buộc
- `documents[0].drive_url`
- `documents[0].document_type`
- `support_needs.primary_need`
- `current_blocker` ngắn
- `deadline`
- `contact.full_name`
- một kênh liên hệ: `zalo` hoặc `email`
- `boundary_confirmations`

### Giữ nhưng chỉ là tùy chọn
- `expected_outputs`
- `support_needs.extra_notes`
- `lecturer_feedback`
- `team_context.team_status_summary`
- `school`
- `course_context`
- `team_context.group_no`
- `team_context.project_name`

## Vì sao cắt như vậy vẫn an toàn
Tài liệu nguồn đã chứa phần lớn context chiến lược:
- khách hàng mục tiêu
- customer story
- pain point
- current alternatives
- solution
- MVP
- bằng chứng / giả định
- business model
- tóm tắt tổng thể

Điều này xuất hiện ở cả hai kiểu case đã đọc:
- case 155 theo template khá chặt
- case 26 không theo template chuẩn nhưng vẫn rất đầy đủ

Vì vậy intake không cần thu lại startup narrative. Intake chỉ cần khoanh đúng yêu cầu hiện tại.

## Hợp đồng dữ liệu tối thiểu mới

### Tối thiểu cần có để supporter xử lý
1. Link tài liệu nguồn
2. Loại tài liệu nguồn
3. Nhu cầu hỗ trợ chính
4. Điểm nghẽn hiện tại
5. Deadline
6. Thông tin liên hệ

### Thông tin nên có thêm nếu có
1. Phản hồi từ giảng viên
2. Mô tả đầu ra mong muốn
3. Metadata về nhóm / môn học

## Rescue path cho nhóm chưa có tài liệu

### Quyết định UX
Không dùng cơ chế đánh giá hồ sơ tự động ngay khi user dán URL.

Thay vào đó, trong `apps/web-1/public/idea-template` đã có sẵn 2 tài liệu public:
- `TEMPLATE_STARTUP_CHECKPOINT1_V2.md`
- `TEMPLATE_STARTUP_CHECKPOINT1_V2.docx`

Frontend chỉ cần tận dụng trực tiếp 2 file này.

### Vị trí hiển thị
Đặt một alert cố định ngay phía trên field nhập URL Drive trong bước tài liệu.

### Mục tiêu alert
- Cứu nhóm chưa có proposal
- Cứu nhóm đang bí, chưa biết viết thế nào
- Không cần backend check gì cả ở thời điểm này
- Không chặn người đã có hồ sơ tốt

### Nội dung alert đề xuất
Heading:
`Chưa có hồ sơ hoặc ý tưởng còn mơ hồ?`

Body:
`Nếu nhóm chưa có proposal đủ rõ, hãy dùng mẫu có sẵn để điền nhanh các phần cốt lõi. Sau khi hoàn tất, đưa file vào Google Drive rồi dán link ở đây.`

### Cơ chế tương tác ở frontend
Dùng một select với đúng 2 option:
1. `Copy Markdown mẫu`
2. `Tải file .docx`

Ý nghĩa:
- `Copy Markdown mẫu`: frontend fetch file markdown công khai từ `public/idea-template/TEMPLATE_STARTUP_CHECKPOINT1_V2.md`, copy toàn bộ nội dung vào clipboard cho user
- `Tải file .docx`: frontend trỏ thẳng tới file công khai `public/idea-template/TEMPLATE_STARTUP_CHECKPOINT1_V2.docx` để tải về

### Vì sao chọn cách này
- KISS
- không cần Google API
- không cần LLM
- không có vấn đề spam field input
- không cần rate limit cho hành vi gõ URL
- user nhận hướng dẫn đúng ngay tại chỗ cần tài liệu
- tận dụng đúng asset đã có sẵn trong `apps/web-1/public/idea-template`

## Gợi ý UX copy

### Thay bước ý tưởng bằng
Heading: `Hồ sơ của nhóm đã có sẵn chưa?`
Helper: `Dán link thư mục hoặc Google Docs nhóm đã chuẩn bị. Supporter sẽ đọc trực tiếp từ đây, nên bạn không cần viết lại toàn bộ ý tưởng.`

### Alert hỗ trợ mẫu trên phần URL
Heading: `Chưa có hồ sơ hoặc ý tưởng còn mơ hồ?`
Body: `Nếu nhóm chưa có proposal đủ rõ, hãy dùng mẫu có sẵn để điền nhanh các phần cốt lõi. Sau khi hoàn tất, đưa file vào Google Drive rồi dán link ở đây.`

### Option trong select
- `Copy Markdown mẫu`
- `Tải file .docx`

### Thay bước context dài bằng
Heading: `Hiện tại nhóm đang cần giúp gì nhất?`
Helper: `Chỉ cần nói điểm đang kẹt nhất lúc này. Ví dụ: bị chê Financial Plan yếu, chưa rõ customer segment, logic solution chưa chặt.`

### Placeholder cho blocker ngắn
`Ví dụ: Team đã có đủ proposal và slide, nhưng giảng viên nói phần customer pain còn mơ hồ. Cần supporter phản biện giúp trước thứ 5.`

## Gợi ý validation

### Validation cứng
- Link Drive/Docs hợp lệ
- Có ít nhất một loại tài liệu
- Đã chọn nhu cầu hỗ trợ chính
- Blocker không được để trống
- Deadline hợp lệ
- Có ít nhất một kênh liên hệ

### Validation mềm
- expected outputs
- lecturer feedback
- metadata nhóm / môn học

## Quy tắc fallback

### Nếu tài liệu yếu / thiếu / không đọc được
Ở v1, không cố tự chấm mức yếu của tài liệu bằng AI realtime.

Fallback thực tế là:
1. Cho user thấy alert + select lấy mẫu ngay trong bước tài liệu
2. User tự hoàn thiện tài liệu theo mẫu
3. User upload / thêm vào Drive rồi quay lại dán link
4. Nếu vẫn muốn gửi hồ sơ mỏng, supporter xử lý theo quy trình bổ sung sau

Nguyên tắc:
`guidance-first`, không phải `auto-judge-first`

## Blueprint cho màn review
Thứ tự:
1. Điểm nghẽn hiện tại
2. Nhu cầu hỗ trợ
3. Tài liệu đính kèm
4. Deadline
5. Phản hồi giảng viên
6. Liên hệ
7. Metadata nhóm / môn học nếu có

Lý do:
Supporter cần triage vận hành trước, không cần đọc lại toàn bộ startup story ở màn review.

## Blueprint cho AI / doc parsing
Giai đoạn 1:
- Không parse theo kiểu blocking
- Chỉ thu link tài liệu
- Supporter đọc tài liệu thủ công

Giai đoạn 2:
- Trích xuất summary preview từ tài liệu
- Prefill project name, customer, pain, solution, course context
- Cho người dùng chỉnh lại

Giai đoạn 3:
- Tự động sinh brief cho supporter gồm:
  - tóm tắt startup
  - điểm nghẽn hiện tại
  - các góc cần phản biện
  - cờ báo thiếu bằng chứng

Lưu ý kiến trúc:
- Nếu sau này có đánh giá chất lượng hồ sơ, chỉ chạy ở action explicit hoặc background job
- Không gắn cơ chế đó vào field nhập URL Drive

## Gợi ý mapping dữ liệu
Nếu cần, schema hiện tại vẫn có thể giữ gần như nguyên.

Cách xử lý khuyến nghị:
- giảm vai trò của `case_summary`, `current_situations`
- đưa `current_blocker` thành field hạng nhất nếu có thể
- nếu chưa muốn đổi backend ngay, có thể tạm map `current_blocker` vào `expected_outputs` hoặc `support_needs.extra_notes`, nhưng đây chỉ là giải pháp tạm thời

Mô hình semantic tốt hơn về dài hạn:
- `background_context_source` = tài liệu
- `current_request` = short form intake

## Rủi ro
- Một số nhóm vẫn không bấm mở mẫu dù tài liệu còn yếu
- Một số tài liệu có thể đã cũ so với blocker hiện tại
- Chỉ dùng alert hướng dẫn thì vẫn phụ thuộc vào ý thức tự bổ sung của user

## Giảm thiểu rủi ro
- Đặt alert đúng ngay trên field URL để tăng khả năng thấy
- Copy viết theo hướng cứu hộ, không mang tính phán xét
- Dùng đúng 2 lựa chọn đơn giản trong select để giảm ma sát
- Giữ blocker ngắn ở mức bắt buộc để supporter vẫn có điểm vào việc rõ ràng

## Chỉ số thành công
- Thời gian hoàn thành intake trung vị giảm
- Tỷ lệ bỏ dở form giảm
- Số lượng narrative bị lặp lại trong submission giảm
- Tỷ lệ user dùng template khi chưa có hồ sơ tăng
- Supporter hiểu yêu cầu trong 30–60 giây
- Người dùng phản hồi kiểu `không phải viết lại proposal`

## Khuyến nghị cụ thể cho v1
Ship bản nhỏ nhất nhưng hữu ích:
1. Bỏ các field ý tưởng / bối cảnh dài khỏi flow mặc định
2. Đưa link tài liệu lên trung tâm
3. Thêm alert cố định ngay trên field URL Drive
4. Trong alert, dùng select 2 lựa chọn:
   - copy markdown mẫu
   - tải docx
5. Dùng trực tiếp asset trong `apps/web-1/public/idea-template`
6. Thêm field blocker ngắn bắt buộc
7. Giữ primary need + deadline + contact
8. Sắp xếp lại review summary xoay quanh current ask

## Khuyến nghị cụ thể cho v2
1. Parse tài liệu để tạo preview
2. Prefill metadata
3. Gắn cờ chất lượng hồ sơ yếu bằng background processing nếu cần
4. Tạo supporter-ready brief tự động

## Sự thật khó chịu
Intake hiện tại đang tối ưu cho việc thu narrative có cấu trúc.
Người dùng lại đang cần cảm giác được giải tỏa lúc khủng hoảng.
Hai mục tiêu này xung đột nhau.
Ở giai đoạn sản phẩm này, nên ưu tiên giảm tải cho người dùng.

Với v1, guidance tĩnh đặt đúng chỗ có giá trị hơn nhiều so với một hệ thống auto-check đắt đỏ nhưng mong manh.

## Bước tiếp theo
Nếu chốt hướng này, có thể chuyển blueprint thành implementation plan, chạm vào:
- intake steps
- alert rescue path trong `DocumentInputStep`
- select lấy template ở frontend
- logic copy markdown / tải docx
- intake schema
- review summary

## Câu hỏi còn mở
- Backend có nhận `current_blocker` sạch sẽ được không?
- Deadline có nên tiếp tục là bắt buộc cho mọi package không?
- Chỉ cần một kênh liên hệ là đủ, hay vẫn muốn bắt cả Zalo và email?
- Có cần track analytics cho hành vi `Copy Markdown mẫu` và `Tải file .docx` không?