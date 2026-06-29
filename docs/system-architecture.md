# System Architecture

## 1. Mục tiêu tài liệu

Tài liệu này mô tả architecture hiện trạng phục vụ MVP demo Nexus, bám codebase đang có thay vì mô tả tương lai giả định.

## 2. Kiến trúc tổng quan

Nexus hiện là monorepo Turborepo với 3 vùng chính:
- `apps/web-1`: product frontend Next.js 16
- `apps/api`: backend Hono + Better Auth + Prisma
- `packages/ui`: UI primitives dùng chung

## 3. Frontend surfaces chính

### 3.1 Intake
- route student intake sống trong `apps/web-1/app/dashboard/intake/`
- workflow nhiều bước, save draft local, submit lên `/cases`
- document step hiện dùng Drive/Docs URL + checklist loại tài liệu

### 3.2 Student dashboard + case workspace
- dashboard liệt kê case của user
- case workspace có sidebar SPA
- các tab chính hiện tại gồm idea, report, discussion, timeline, settings
- page dùng `useCaseDetails(id)` để lấy dữ liệu workspace

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`

### 3.3 Supporter workspace
- supporter mở case bằng shell rất giống student workspace
- supporter tái dùng `WorkspaceSidebar`, `CaseStatusHeader`, `TabDiscussionChat`, `ActivityTimeline`
- supporter không có settings tab trong workspace
- supporter có review page riêng để generate/edit/approve report

Tham chiếu:
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`

### 3.4 Admin triage
- admin có modal chi tiết case để đọc intake snapshot, documents, support needs
- admin có action yêu cầu làm rõ, từ chối, duyệt, phân công supporter

Tham chiếu:
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`

## 4. Backend responsibilities

### 4.1 Auth và session
- auth/session thuộc `apps/api`
- frontend dựa vào session để gate dashboard, supporter, admin surfaces

### 4.2 Case workflow
- backend cung cấp endpoints cho case detail, message thread, status update, settings update, admin triage, supporter actions
- frontend không sở hữu workflow semantics; frontend chủ yếu map và trình bày

### 4.3 Report workflow
- supporter review page làm việc với draft report và approve/send flow
- report là output chính thức của supporter, không để chat thay vai trò này

## 5. Case workspace data flow

## 5.1 Case details
`useCaseDetails(id)` hiện:
- GET `/cases/:id`
- polling mỗi 10 giây
- trả về:
  - `case`
  - `intake_snapshot`
  - `latest_report`
  - `latest_user_action`
  - `document_board_sections`
  - `round_history`
  - `open_requests_for_more_info`

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`

## 5.2 Chat / discussion
`useCaseChat(caseId)` hiện:
- GET `/cases/:id/messages`
- POST `/cases/:id/messages`
- polling mỗi 5 giây
- invalidate query sau khi gửi

Đây là text chat bằng REST + polling, không phải realtime socket.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseChat.ts`
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`

## 5.3 Timeline / activity log
- `ActivityTimeline` đọc `caseData.events`
- timeline hiện map nhiều event_type sang label UI
- timeline là lớp truy vết user-facing cho case progression

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`
- `apps/web-1/types/case.ts`

## 6. Data model bề mặt frontend đáng chú ý

## 6.1 Case
`Case` hiện đã có:
- `user_facing_stage`
- `internal_status`
- `payment_status`
- `messages`
- `events`
- `lifecycle_units`
- `reports`

Điều này cho thấy workspace hiện tại đã bám một model giàu hơn nhiều so với form submit đơn giản.

Tham chiếu:
- `apps/web-1/types/case.ts`

## 6.2 Message
`CaseMessage` hiện gồm:
- `sender_auth_user_id`
- `sender_role_snapshot`
- `content`
- `created_at`
- optional `sender`

## 6.3 Event
`CaseEvent` hiện gồm:
- `event_type`
- `actor_auth_user_id`
- optional links tới document/report/audit_round/payment/meeting
- `metadata_json`
- `created_at`

## 6.4 Intake document
`IntakeDocument` hiện gồm:
- `source_type: "drive" | "upload"`
- `drive_url?`
- `file_url?`
- `document_type`
- `role_description`

Tham chiếu:
- `apps/web-1/app/dashboard/intake/_types/intake.types.ts`

## 7. Document intake model hiện trạng

Current intake UI không phải multi-document manager đầy đủ.

Nó hiện hoạt động như sau:
- dùng `documents[0]` như primary document bundle;
- yêu cầu user nộp 1 Drive/Docs URL chính;
- user tick checklist loại tài liệu có trong thư mục;
- UI tạo summary string cho `document_type` và `role_description`.

Điều này nghĩa là intake document model hiện là hybrid sơ khai, chưa phải file-by-file structured upload flow.

Tham chiếu:
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`
- `apps/web-1/app/dashboard/intake/hooks/useIntakeForm.ts`

## 8. Role boundaries

### Student
- tạo case
- xem case workspace
- chat với supporter/admin nếu luồng cho phép
- xem timeline
- xem report và nộp revision

### Supporter
- mở case workspace cùng shell
- xem context/timeline/chat
- vào review page để tạo hoặc chỉnh báo cáo phản biện

### Admin
- triage, reject, request more info, approve
- assign hoặc reassign supporter

## 9. Architectural constraints cho MVP demo

- Không nên refactor backend workflow trước demo.
- Không nên thay schema tài liệu lớn trước demo.
- Không nên giới thiệu websocket/realtime claims nếu code chưa có.
- Không nên mô tả upload flow như đã hoàn chỉnh nếu UI intake vẫn thiên về Drive link.
- Không nên phá shared workspace shell; đây là lợi thế hiện tại của codebase.

## 10. Architectural direction ngắn hạn đã chốt

- Giữ nguyên shell và route structure hiện tại.
- Dùng semantic/UX realignment để làm rõ narrative.
- Dùng shared frontend mapping cho status nếu khả thi.
- Xem text chat là core MVP coordination path.
- Xem timeline là lớp continuity/trust layer.
- Xem report là output chính thức của supporter.

## 11. Những gì chưa nên hứa trong tài liệu

Không ghi như thể đã có sẵn:
- realtime chat bằng socket;
- document ingestion file-by-file hoàn chỉnh;
- event sourcing đầy đủ;
- document version manager hoàn chỉnh cho mọi artifact;
- automation AI mới chưa tồn tại trong luồng hiện tại.
