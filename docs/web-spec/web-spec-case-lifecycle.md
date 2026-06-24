# Case lifecycle, status, flags, và document lifecycle

## Case stage và status

Không dùng một status duy nhất để gộp tất cả.

Nên tách 3 lớp:

1. user-facing stage;
2. internal case status;
3. operational flags.

## User-facing stage

Stage nhìn từ phía user, ví dụ:

- đang bổ sung thông tin;
- Nexus đang audit;
- đã có report;
- chờ bạn gửi bản sửa.

## Internal case status

Trạng thái vận hành nội bộ, ví dụ:

- `NEW_REQUEST`
- `WAITING_FOR_DOCUMENT`
- `INPUT_CLARIFICATION`
- `AUDIT_IN_PROGRESS`
- `REPORT_REVIEW`
- `REPORT_SENT`
- `WAITING_FOR_REVISION`
- `RE_AUDIT`
- `COMPLETED`

## Operational flags

Flags là nhãn phụ, không phải status chính.

Ví dụ:

- `urgent`
- `missing_customer`
- `missing_pain`
- `missing_current_alternative`
- `needs_human_review`
- `payment_pending`
- `deadline_close`
- `team_capability_risk`

Một case có thể vừa có `AUDIT_IN_PROGRESS`, vừa có `urgent`, vừa có `missing_current_alternative`.

### Severity tags từ AI draft

AI gán các tag sau cho case dựa trên phân tích ban đầu:

- `Missing` — thiếu thông tin quan trọng.
- `Too vague` — thông tin quá chung chung, chưa đủ để audit.
- `Mixed frame` — user đang trộn nhiều khung nhìn hoặc khái niệm không nhất quán.
- `Unsupported claim` — khẳng định chưa có dữ liệu hoặc logic hỗ trợ.

Các tag này là operational flags, không phải status chính. Một case có thể mang nhiều tag cùng lúc.

## Drive lifecycle

Drive là source of truth cho file lifecycle.

### Cấu trúc folder

`Case → Checkpoint → Lifecycle Unit → File`

Chỉ nên giữ 3 cấp thư mục, không đi sâu hơn.

### Versioning

- `vNN` là document or service version;
- `aNN-vNN` là assessment round.

Ý chính là version tài liệu và vòng đánh giá phải tách riêng.

Không overwrite file.

Mỗi bản tài liệu mới là một version mới.

Report cũng đi qua lifecycle riêng: `AI_DRAFT` → `SUPPORTER_REVIEW` → `APPROVED` → `SENT` → `SUPERSEDED` hoặc `ARCHIVED`.

Report final có thể được export ra `.md` hoặc `.pdf` rồi lưu về đúng folder lifecycle của case/checkpoint/version đó.

## Artifact chính cần lưu

- intake input;
- document version;
- assessment round;
- AI draft;
- supporter review;
- report final;
- payment proof;
- meeting note;
- revision history;
- activity timeline.

## File naming rule

Format canonical được nhắc trong transcript:

`<case_id>_<group_no>_<checkpoint>_<unit>_<direction>_<doc_type>[_<seq>].<ext>`

Trong đó `direction` thường là `input`, `output`, hoặc `evidence`.

## Postgres chỉ mirror metadata

Postgres không thay Drive.

Nó chỉ mirror:

- case metadata;
- checkpoint metadata;
- lifecycle unit;
- report metadata;
- payment metadata;
- AI job;
- event log;
- permission liên quan workflow.

## Định danh dữ liệu cốt lõi

- `case_id`
- `checkpoint_id`
- `lifecycle_unit_id`
- `document_id`
- `report_id`
- `audit_round_id`
- `payment_id`
- `meeting_id`

Những định danh này phải sinh từ backend, không suy ra từ chat tự do.
