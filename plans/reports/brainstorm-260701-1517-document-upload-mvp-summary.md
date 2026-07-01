# Document upload MVP brainstorm summary

## Goal
MVP phải cover full business loop cho document workspace:
- user nộp tài liệu đúng flow
- supporter trả output tài liệu
- supporter/admin thêm evidence đánh giá
- workspace đọc được lịch sử theo lifecycle chuẩn

## Current state observed
Đã có:
- document workspace read model/backend assembly
- workspace UI để đọc version/assessment files
- revision submit business flow cơ bản
- Cloudinary upload pattern riêng ở payment proof

Chưa có đủ:
- post-intake file upload flow cho user/supporter
- supporter output upload flow
- supporter/admin evidence upload flow
- DB-backed master data cho canonical document types
- clean modal UX cho các action upload

## Business model locked
Document structure chuẩn:
- `Case -> Checkpoint -> Lifecycle Unit -> File`

Lifecycle unit:
- `vNN` = version/submission unit
- `aNN-vNN` = assessment unit gắn với version

Direction:
- `input`
- `output`
- `evidence`

## Key decisions locked
### 1. Two write modes coexist
- **url-based** chỉ dùng cho **intake/create-case**.
- **file-based** dùng cho **mọi flow sau intake**.

Lý do:
- intake đầu cần nhanh, Drive link đủ dùng
- post-intake cần quản trị chặt, không phụ thuộc permission/link ngoài
- tránh nhập nhằng link vs file ở workspace về sau

### 2. File-based uploads use Cloudinary
- post-intake uploads phải đi qua Cloudinary
- server upload thành công trước, rồi mới ghi DB
- nếu DB write fail sau upload, phải delete asset trên Cloudinary

Lý do:
- tránh mismatch giữa `document_records` và file thật
- thống nhất storage source cho user/supporter post-intake flows

### 3. Payment proof is separate
- payment proof không dùng chung document upload flow
- payment proof chỉ cho **image-only upload**
- payment flow giữ endpoint/logic riêng

Lý do:
- payment proof không có semantics `checkpoint/unit/doc_type/direction`
- scope nhỏ hơn, validate đơn giản hơn
- tránh trộn domain payment với domain documents

### 4. Post-intake UI uses modal actions
- user revision submit = modal
- supporter output upload = modal
- supporter/admin evidence upload = modal

Lý do:
- UI sạch hơn
- action theo vai trò rõ ràng
- không nhồi inline controls vào document table

### 5. Canonical document types move to DB master data
- không giữ hardcoded enum làm source of truth lâu dài
- tạo `document_types` table
- seed full canonical list từ spec
- `document_records.doc_type` tạm giữ string code ở MVP

Lý do:
- canonical types nhiều và sẽ đổi theo business
- cần thêm/bớt/disable type mà không phải sửa code khắp nơi
- MVP vẫn nên tránh refactor quá mạnh sang FK ngay

## Canonical document type direction
Spec canonical list nên seed đầy đủ vào `document_types`:

### Input
- `cp1-doc`
- `cp2-doc`
- `slide`
- `canvas`
- `form-response`
- `revision-note`
- `interview-note`
- `market-research`

### Output
- `clarity-audit`
- `reality-check`
- `solution-critique`
- `reaudit`
- `check-logic`
- `summary-report`

### Evidence
- `lecturer-feedback`
- `mentor-note`
- `pass-assessment`
- `fail-assessment`
- `screenshot`

## Recommended API shape direction
### Intake
- giữ request URL-based hiện tại
- chỉ validate Drive URL/reference mode
- không upload Cloudinary ở bước này

### Post-intake
Tách endpoint theo business action, không trộn file/url trong cùng contract:
- revision file submit
- supporter output file submit
- supporter/admin evidence file submit

Contract nên là multipart upload + metadata fields cần thiết.
Server phải tự derive:
- `source_kind=cloudinary`
- `file_url`
- `download_url`
- `original_name`
- `extension`
- `mime_type`
- `cloudinary_public_id`

## Write-flow rule locked
- upload file thành công trước
- sau đó mới persist DB row
- DB fail => rollback asset ở Cloudinary
- không cho mixed URL/file payload ở post-intake endpoints
- URL validation path chỉ sống ở intake flow

## Reuse opportunities from current codebase
- reuse payment multipart/Cloudinary pattern cho document file upload
- reuse revision business flow hiện có cho checkpoint/version selection và stage guards
- reuse document workspace read model hiện tại, không cần đập lại

## Migration direction
- tạo `document_types` table + seed canonical list
- backend validation chuyển từ hardcoded list sang DB-backed active types
- map old generic document types sang canonical codes nếu cần
- giữ compatibility cho intake URL-based flow cũ
- chỉ backfill records cũ khi cần để workspace đọc đúng

## Remaining open items before implementation
- exact endpoint names + payload fields cho 3 post-intake flows
- exact schema fields của `document_types`
- exact mime/size allowlist cho document uploads
- rule tạo assessment round (`aNN-vNN`) ở evidence flow
- UI action placement chi tiết trong workspace pages

## Implementation note
Checklist triển khai đã tách riêng tại:
- `plans/reports/checklist-260701-1517-document-upload-mvp.md`

Report này để giữ reasoning và quyết định đã chốt. Checklist để bám implement.
