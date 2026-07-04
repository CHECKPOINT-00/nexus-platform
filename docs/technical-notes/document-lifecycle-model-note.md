# Technical Note: Document Lifecycle Model

## 1. Mục tiêu

Ghi lại model nội bộ để migrate từ Google Drive manual structure sang object model trong web mà không làm mất lịch sử version, assessment, và artifact.

## 2. Source of truth tham chiếu

- Manual document system trong `docs/nexus-document/document-system/document-lifecycle-management.md`
- Manual case intake form
- Manual case management sheet
- Manual audit workflow dùng ChatGPT

## 3. Model nội bộ đề xuất

`case -> checkpoint -> version -> assessment -> artifact`

### Case

Hồ sơ hỗ trợ độc lập cho một team.

### Checkpoint

Mốc như `cp1`, `cp2`.

### Version

Bản tài liệu cụ thể do team gửi hoặc bản Nexus đang xử lý gắn với một input version cụ thể.

### Assessment

Vòng phản hồi / review / đánh giá dựa trên một version.

### Artifact

Tài liệu cụ thể thuộc một version hoặc assessment, có direction như `input`, `output`, `evidence`.

## 4. Mapping user-facing vs internal

### Internal naming

- `v01`
- `a01-v01`
- `input`
- `output`
- `evidence`

### User-facing naming

- `Bản nhóm gửi lần 1`
- `Report vòng 1`
- `Feedback giảng viên`
- `Bản nhóm sửa lần 2`

UI không nên bắt user đọc trực tiếp naming nội bộ, nhưng backend nên giữ logic đó.

## 5. Quy tắc migrate quan trọng

- Không ghi đè artifact cũ.
- Bản sửa mới của team tạo version hoặc round mới phù hợp.
- Feedback mới không tự động tạo version mới.
- Report cũ trở thành lịch sử, không biến mất.
- Artifact nội bộ và artifact user-facing phải có visibility rõ ràng.

## 6. Ảnh hưởng tới UI

- User workspace cần document board theo round.
- Supporter workspace cần thấy round hiện tại và round trước.
- Admin không cần thấy mọi naming storage-level, nhưng cần đủ metadata để triage.
- Report artifact phase 1 nên hỗ trợ rich text trong hệ thống và optional file attachment.

## 7. Thiếu / chưa rõ

- Chưa khóa chính xác schema DB cho `version` và `assessment`.
- Chưa khóa artifact type list chi tiết cho phase 1.
