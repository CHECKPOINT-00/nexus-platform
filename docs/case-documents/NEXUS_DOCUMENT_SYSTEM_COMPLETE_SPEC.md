# Nexus Document System Complete Spec

## 1. Mục đích

Tài liệu này là bản mô tả đầy đủ, độc lập và tự chứa về cách tổ chức kho tài liệu Nexus.

Mục tiêu:

- giải thích rõ cấu trúc thư mục;
- giải thích ý nghĩa tên file;
- mô tả quy trình lifecycle của tài liệu;
- đưa ra quy tắc vận hành thống nhất;
- đủ để mang sang nơi khác mà không cần đọc thêm file nào khác.

## 2. Phạm vi

Áp dụng cho toàn bộ kho tài liệu dùng để quản lý tài liệu hỗ trợ nhóm sinh viên hoặc khách hàng trong quá trình audit, phản hồi, đánh giá checkpoint và lưu trữ lịch sử làm việc.

Tài liệu này áp dụng cho các định dạng phổ biến như:

- `pdf`
- `docx`
- `md`
- `xlsx`
- `png`
- `jpg`

## 3. Mô hình tổ chức tổng thể

Kho tài liệu được tổ chức theo đúng 3 cấp:

```text
Case -> Checkpoint -> Lifecycle Unit -> File
```

Giải thích:

- `Case`: một nhóm hoặc một hồ sơ công việc riêng.
- `Checkpoint`: một mốc đánh giá như CP1, CP2.
- `Lifecycle Unit`: một đơn vị vòng đời bên trong checkpoint.
- `File`: tài liệu vật lý nằm trong lifecycle unit tương ứng.

Không dùng cây thư mục sâu hơn mô hình này.

## 4. Các khái niệm cốt lõi

### 4.1. Case

Một case đại diện cho một nhóm hoặc một đối tượng được theo dõi độc lập.

Mỗi case có đúng một folder riêng ở thư mục gốc.

Mẫu:

```text
<case_id>_<group_no>/
```

Ví dụ:

```text
0001_155/
0010_189/
```

Trong đó:

- `case_id`: mã case nội bộ, luôn là số.
- `group_no`: mã nhóm hoặc mã dự án.

### 4.2. Checkpoint

Checkpoint là một mốc đánh giá trong lifecycle hỗ trợ.

Ví dụ:

- `cp1`
- `cp2`

Mỗi checkpoint có lifecycle riêng, không trộn tài liệu giữa các checkpoint.

### 4.3. Lifecycle Unit

Lifecycle unit là đơn vị vòng đời nhỏ nhất được biểu diễn bằng folder.

Có 2 loại:

1. `vNN`
   Đại diện cho document/service version.
2. `aNN-vNN`
   Đại diện cho assessment round chấm trên version `vNN`.

Ví dụ:

- `v01`
- `v02`
- `a01-v01`
- `a02-v02`

### 4.4. Direction

Direction cho biết vai trò của file:

- `input`: tài liệu đầu vào từ nhóm hoặc khách hàng
- `output`: tài liệu đầu ra do Nexus tạo
- `evidence`: bằng chứng, phản hồi, ghi chú, ảnh chụp, kết quả chấm

### 4.5. Doc Type

Doc type là loại tài liệu nghiệp vụ.

Doc type phải là tên canonical, rõ nghĩa, thống nhất và không tự phát sinh tùy tiện.

## 5. Cấu trúc thư mục chuẩn

Mẫu chuẩn:

```text
<case_id>_<group_no>/
  cp1/
    v01/
      <file>.ext
    a01-v01/
      <file>.ext
    v02/
      <file>.ext
    a02-v02/
      <file>.ext
  cp2/
    v01/
      <file>.ext
```

Ví dụ:

```text
0001_155/
  cp1/
    v01/
      0001_155_cp1_v01_input_cp1-doc.pdf
      0001_155_cp1_v01_input_slide.pdf
      0001_155_cp1_v01_output_clarity-audit.docx
    a01-v01/
      0001_155_cp1_a01-v01_evidence_lecturer-feedback.pdf
    v02/
      0001_155_cp1_v02_input_cp1-doc.pdf
      0001_155_cp1_v02_output_reaudit.docx
    a02-v02/
      0001_155_cp1_a02-v02_evidence_pass-assessment.png
  cp2/
    v01/
      0001_155_cp2_v01_input_cp2-doc.pdf
```

## 6. Quy tắc folder

1. 1 case = 1 folder.
2. Checkpoint là cấp con đầu tiên bên trong case.
3. Lifecycle unit là cấp con duy nhất bên trong checkpoint.
4. File nằm thẳng trong lifecycle unit.
5. Không tạo folder con cho `input`, `output`, `evidence`.
6. Không tạo folder phụ kiểu `draft`, `final`, `feedback`, `images` bên trong unit.
7. Không tạo log riêng nếu thông tin đã thể hiện được bằng folder và tên file.
8. Không đặt file trực tiếp ở case folder nếu file đó thuộc một checkpoint cụ thể.

## 7. Naming Rule

Tên file chuẩn:

```text
<case_id>_<group_no>_<checkpoint>_<unit>_<direction>_<doc_type>[_<seq>].<ext>
```

Ví dụ:

```text
0001_155_cp1_v01_input_cp1-doc.pdf
0001_155_cp1_v01_output_clarity-audit.docx
0001_155_cp1_a01-v01_evidence_lecturer-feedback.png
```

## 8. Ý nghĩa từng phần trong tên file

- `case_id`: mã case
- `group_no`: mã nhóm hoặc mã dự án
- `checkpoint`: `cp1`, `cp2`, ...
- `unit`: `vNN` hoặc `aNN-vNN`
- `direction`: `input`, `output`, `evidence`
- `doc_type`: loại tài liệu canonical
- `seq`: số thứ tự bổ sung khi có nhiều file cùng loại trong cùng một unit
- `ext`: phần mở rộng thật của file

## 9. Quy tắc chi tiết cho từng thành phần

### 9.1. `case_id`

- là số
- nên chuẩn hóa về độ dài cố định nếu hệ thống hiện hành đang dùng
- ví dụ: `0001`, `0012`

### 9.2. `group_no`

- là mã nhóm hoặc mã dự án
- giữ nguyên logic mã hiện hành
- ví dụ: `155`, `42`, `189`

### 9.3. `checkpoint`

- viết thường
- dùng mẫu `cp1`, `cp2`
- không dùng `CP1`, `checkpoint1`, `c1`

### 9.4. `unit`

- version dùng `vNN`
- assessment round dùng `aNN-vNN`
- `NN` luôn là 2 chữ số

Ví dụ hợp lệ:

- `v01`
- `v02`
- `a01-v01`
- `a02-v02`

### 9.5. `direction`

Chỉ được dùng một trong ba giá trị:

- `input`
- `output`
- `evidence`

Không dùng:

- `in`
- `out`
- `feedback`
- `result`

### 9.6. `doc_type`

`doc_type` phải:

- viết thường
- dùng dấu `-` để ngăn từ
- mô tả đúng bản chất tài liệu
- ổn định theo thời gian

Ví dụ hợp lệ:

- `cp1-doc`
- `cp2-doc`
- `slide`
- `canvas`
- `clarity-audit`
- `reaudit`
- `lecturer-feedback`
- `mentor-note`
- `pass-assessment`
- `form-response`
- `revision-note`
- `interview-note`
- `check-logic`
- `market-research`

Không dùng tên mơ hồ như:

- `document`
- `final`
- `new`
- `updated`
- `file1`

### 9.7. `seq`

`seq` chỉ dùng khi trong cùng một lifecycle unit có nhiều file cùng:

- `direction`
- `doc_type`

Ví dụ:

```text
0001_155_cp1_v01_input_form-response_01.xlsx
0001_155_cp1_v01_input_form-response_02.xlsx
```

Quy tắc:

- bắt đầu từ `01`
- tăng dần trong cùng unit
- reset ở unit khác
- không dùng `seq` để biểu diễn lifecycle

## 10. Nguyên tắc rất quan trọng

1. `vNN` là version tài liệu hoặc version xử lý, không phải số lần chấm.
2. `aNN` là assessment round, không phải version tài liệu.
3. `seq` không đại diện cho vòng đời.
4. Feedback và evidence phải nằm ở `aNN-vNN`, không lẫn trong `vNN` nếu đó là assessment độc lập.
5. Không ghi đè file cũ để giả lập version mới.
6. Không tạo version mới chỉ vì có feedback mới.

## 11. Lifecycle tài liệu

Mỗi tài liệu đi qua 5 giai đoạn:

```text
Tiếp nhận -> Phân loại -> Xử lý -> Phản hồi -> Lưu trữ / Tra cứu
```

### 11.1. Tiếp nhận

Nguồn vào có thể là:

- nhóm sinh viên
- khách hàng
- nội bộ Nexus
- giảng viên

Khi tiếp nhận:

1. xác định case nào
2. xác định checkpoint nào
3. xác định file này là input, output hay evidence
4. xác định file thuộc version hay assessment round

### 11.2. Phân loại

Người vận hành phải quyết định:

- `case_id`
- `group_no`
- `checkpoint`
- `unit`
- `direction`
- `doc_type`
- `ext`

Chỉ sau khi phân loại xong mới đặt tên file và lưu vào kho chính thức.

### 11.3. Xử lý

Khi Nexus tạo tài liệu phân tích, audit hoặc chỉnh sửa:

- output phải nằm trong `vNN` tương ứng
- nếu đó là output của việc xử lý bản `v01`, file nằm trong `v01/`

Ví dụ:

```text
0001_155_cp1_v01_output_clarity-audit.docx
```

### 11.4. Phản hồi

Khi có feedback độc lập hoặc kết quả chấm:

- tạo folder `aNN-vNN`
- lưu evidence vào đó

Ví dụ:

```text
0001_155_cp1_a01-v01_evidence_lecturer-feedback.pdf
0001_155_cp1_a02-v02_evidence_pass-assessment.png
```

### 11.5. Lưu trữ và tra cứu

Nguyên tắc:

- không xóa file gốc nếu không có quy trình kiểm soát rõ ràng
- không ghi đè
- giữ đủ lịch sử để truy vết
- file mới không được phá vỡ logic cũ

## 12. Khi nào tạo `vNN`?

Tạo `vNN` khi:

- nhóm gửi một bản tài liệu mới
- cần biểu diễn một version tài liệu khác biệt rõ ràng
- Nexus tạo output gắn với một bản tài liệu cụ thể đang được xử lý

Không tạo `vNN` khi:

- chỉ có feedback mới
- chỉ có thêm ảnh chụp hoặc bằng chứng chấm
- không có bản tài liệu mới thực sự

## 13. Khi nào tạo `aNN-vNN`?

Tạo `aNN-vNN` khi:

- có lecturer feedback
- có mentor note
- có bằng chứng pass/fail
- có assessment độc lập không làm thay đổi bản tài liệu gốc

Không tạo `aNN-vNN` khi:

- file chỉ là input ban đầu của nhóm
- file là output xử lý trực tiếp gắn với version tài liệu

## 14. Cách đọc một case

Khi mở một case folder, đọc theo thứ tự:

1. Có những checkpoint nào.
2. Trong mỗi checkpoint có những version `vNN` nào.
3. Có những assessment round `aNN-vNN` nào.
4. Trong từng unit, xem `direction` để biết file là input, output hay evidence.
5. Nếu cần bản tài liệu mới nhất, xem `vNN` lớn nhất có ý nghĩa hợp lệ.

## 15. Trạng thái nghiệp vụ có thể suy ra từ cấu trúc

| Trạng thái | Ý nghĩa | Dấu hiệu |
|---|---|---|
| `NO_DATA` | Chưa có dữ liệu | chưa có checkpoint folder |
| `RECEIVED` | Đã nhận tài liệu đầu vào | có `vNN` với file `input` |
| `PROCESSED` | Đã có output xử lý | có file `output` trong `vNN` |
| `ASSESSED` | Đã có feedback/chấm | có `aNN-vNN` |
| `ARCHIVED` | Đã hoàn tất lưu trữ | có dấu hiệu archive theo quy ước nội bộ |

## 16. Danh sách doc_type gợi ý

### 16.1. Input

- `cp1-doc`
- `cp2-doc`
- `slide`
- `canvas`
- `form-response`
- `revision-note`
- `interview-note`
- `market-research`

### 16.2. Output

- `clarity-audit`
- `reality-check`
- `solution-critique`
- `reaudit`
- `check-logic`
- `summary-report`

### 16.3. Evidence

- `lecturer-feedback`
- `mentor-note`
- `pass-assessment`
- `fail-assessment`
- `screenshot`

Nếu xuất hiện loại tài liệu mới, phải chọn một tên canonical rõ ràng và dùng nhất quán từ thời điểm đó.

## 17. Các tình huống đặc biệt

### 17.1. Nhóm gửi bản mới sau feedback

Xử lý:

1. tạo `v02/`
2. lưu bản mới vào `v02/`
3. nếu có output mới của Nexus cho bản đó, cũng lưu vào `v02/`
4. nếu có đánh giá mới trên bản đó, tạo `a02-v02/` hoặc round tương ứng

### 17.2. Có nhiều lần chấm trên cùng một version

Xử lý:

- giữ nguyên `vNN`
- tạo nhiều assessment round khác nhau

Ví dụ:

```text
cp1/
  v01/
  a01-v01/
  a02-v01/
```

### 17.3. Có nhiều file cùng loại trong một unit

Xử lý:

- dùng `seq` nếu thực sự cùng `direction + doc_type`

Ví dụ:

```text
0001_155_cp1_v01_input_form-response_01.xlsx
0001_155_cp1_v01_input_form-response_02.xlsx
```

### 17.4. Có cùng tài liệu ở hai định dạng khác nhau

Nếu cùng nội dung nhưng khác định dạng, có thể giữ cả hai trong cùng unit.

Ví dụ:

```text
0001_155_cp1_v01_input_cp1-doc.docx
0001_155_cp1_v01_input_cp1-doc.pdf
```

Không cần `seq` nếu có thể phân biệt bằng extension và không gây mơ hồ.

### 17.5. Chưa phân loại được file

Nếu chưa đủ thông tin để phân loại an toàn:

- không đặt bừa vào case chính thức
- để tạm vào khu vực chờ phân loại theo quy ước nội bộ
- chỉ chuyển vào kho chính thức sau khi xác định đủ metadata

## 18. Những lỗi thường gặp

1. Tạo `v02` chỉ vì có feedback mới.
2. Đặt lecturer feedback vào `vNN` thay vì `aNN-vNN`.
3. Dùng `seq` để biểu diễn vòng đời.
4. Đặt tên file quá chung chung như `final.pdf`.
5. Tạo thêm folder con bên trong `vNN`.
6. Trộn tài liệu CP1 và CP2 vào cùng chỗ.
7. Ghi đè file cũ thay vì tạo version hoặc unit phù hợp.

## 19. Checklist khi thêm file mới

- [ ] Đã xác định đúng case?
- [ ] Đã xác định đúng group?
- [ ] Đã xác định đúng checkpoint?
- [ ] Đã xác định đúng unit?
- [ ] Đã xác định đúng direction?
- [ ] Đã xác định đúng doc_type?
- [ ] Tên file không dấu, không khoảng trắng?
- [ ] Tên file theo đúng công thức chuẩn?
- [ ] File được đặt vào đúng folder?
- [ ] Không ghi đè file cũ?

## 20. Checklist khi review một case

- [ ] Mỗi checkpoint có cấu trúc hợp lệ?
- [ ] Không có file nằm trực tiếp sai cấp?
- [ ] `vNN` và `aNN-vNN` được dùng đúng nghĩa?
- [ ] Feedback không lẫn trong version folder?
- [ ] Không có folder con thừa?
- [ ] Tên file nhất quán?
- [ ] Có thể truy vết version mới nhất?
- [ ] Có thể truy vết lịch sử assessment?

## 21. Decision Rules

Khi phân vân, dùng các quy tắc quyết định sau:

1. Nếu file là bản tài liệu do nhóm gửi hoặc output xử lý gắn với một bản tài liệu, ưu tiên `vNN`.
2. Nếu file là phản hồi, kết quả chấm, bằng chứng hoặc ghi chú đánh giá độc lập, ưu tiên `aNN-vNN`.
3. Nếu file không thay đổi bản tài liệu nhưng chỉ bổ sung thông tin đánh giá, không tạo version mới.
4. Nếu một tên file không giúp người khác hiểu nội dung mà không cần mở file, tên đó chưa đủ tốt.
5. Nếu phải tạo ngoại lệ quá nhiều để giải thích một case, cấu trúc đang sai chứ không phải case đặc biệt.

## 22. Nguyên tắc đặt tên tốt

Tên file tốt phải đạt đủ:

- truy vết được nguồn gốc
- đọc là hiểu vai trò
- không mơ hồ
- không cần thêm log ngoài để giải thích
- đủ ổn định cho việc tìm kiếm và bàn giao

## 23. Kết luận

Toàn bộ hệ thống được xây trên một ý tưởng đơn giản:

- folder biểu diễn cấu trúc nghiệp vụ;
- tên file biểu diễn metadata cốt lõi;
- lifecycle được đọc từ `checkpoint`, `vNN`, `aNN-vNN`, `direction` và `doc_type`;
- không cần thêm cơ chế phức tạp nếu kỷ luật đặt tên và đặt file được giữ đúng.

Nếu mọi người cùng tuân theo tài liệu này, kho tài liệu sẽ:

- dễ tìm;
- dễ hiểu;
- dễ bàn giao;
- dễ audit;
- dễ mở rộng sang case mới.
