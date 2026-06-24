# Ghi chú data model và artifact

## Nguyên tắc chung

- Better Auth giữ identity và session.
- Nexus DB giữ business data.
- Drive giữ file lifecycle.
- Postgres mirror metadata và workflow.

## Bảng hoặc entity nên có

### cases

- `id`
- `case_code`
- `group_no`
- `owner_auth_user_id`
- `team_name`
- `school`
- `course_context`
- `current_checkpoint`
- `package_id`
- `assigned_supporter_auth_user_id`
- `user_facing_stage`
- `internal_status`
- `payment_status`
- `deadline`
- `created_at`
- `updated_at`

### case_members

- `id`
- `case_id`
- `auth_user_id`
- `role_in_team`
- `access_level`
- `created_at`

### checkpoints

- `id`
- `case_id`
- `checkpoint_code`
- `checkpoint_status`
- `latest_version_no`
- `latest_assessment_no`
- `drive_folder_id`

### lifecycle_units

- `id`
- `case_id`
- `checkpoint_id`
- `unit_code`
- `unit_type`
- `version_no`
- `assessment_no`
- `linked_version_no`
- `drive_folder_id`

### reports

- `id`
- `case_id`
- `checkpoint_id`
- `lifecycle_unit_id`
- `audit_round_id`
- `report_type`
- `content_md`
- `status`
- `created_by`
- `approved_by_auth_user_id`
- `sent_at`
- `document_id`

### payments

- `id`
- `case_id`
- `package_id`
- `amount`
- `status`
- `proof_file_id`
- `verified_by_auth_user_id`
- `verified_at`

### case_messages

- `id`
- `case_id`
- `sender_auth_user_id`
- `sender_role_snapshot`
- `content`
- `created_at`

### case_events

- `id`
- `case_id`
- `event_type`
- `actor_auth_user_id`
- `document_id`
- `report_id`
- `audit_round_id`
- `payment_id`
- `meeting_id`
- `metadata_json`
- `created_at`

### ai_jobs

- `id`
- `case_id`
- `job_type`
- `status`
- `input_json`
- `output_json`
- `attempt_count`
- `created_at`
- `updated_at`

## Những gì không nên tạo lại

- không tự làm `users` table riêng trong domain schema;
- không để workflow state chỉ nằm trong n8n;
- không để file history chỉ nằm trong message text;
- không overwrite version cũ.

## Ghi chú review

Các field trên là ghi chú spec, chưa phải schema cuối cùng. Khi code vào Prisma hoặc DB migration, cần chốt kiểu dữ liệu, quan hệ, và index theo từng màn hình thật.
