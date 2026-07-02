# System Architecture

## 1. Mục tiêu tài liệu

Tài liệu này mô tả architecture hiện trạng phục vụ MVP demo Nexus, bám codebase đang có thay vì mô tả tương lai giả định.

## 2. Kiến trúc tổng quan

Nexus hiện là monorepo Turborepo với 3 vùng chính:
- `apps/web-1`: product frontend Next.js 16
- `apps/api`: backend Hono + Better Auth + Prisma
- `packages/ui`: UI primitives dùng chung

Data model trung tâm nằm ở `prisma/schema.prisma`, với auth, case, checkpoint, lifecycle unit, document record, report, payment, event, và AI job.

## 3. Frontend surfaces chính

### 3.1 Intake
- route student intake sống trong `apps/web-1/app/dashboard/intake/`
- workflow nhiều bước, save draft local, submit lên `/cases`
- document step hiện dùng 1 Drive/Docs URL chính + checklist loại tài liệu
- step này còn có template helper để copy Markdown hoặc tải `.docx`

Tham chiếu:
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`

### 3.2 Student dashboard + case workspace
- dashboard liệt kê case của user
- case workspace có sidebar shell
- điều hướng chính hiện bám `documents`, `discussion`, `timeline`, `settings`
- page dùng `useCaseDetails(id)` để lấy dữ liệu workspace
- payment tồn tại như surface phụ qua unpaid banner và payment page riêng

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`
- `apps/web-1/app/dashboard/case/[id]/payment/page.tsx`

### 3.3 Supporter workspace
- supporter mở case bằng shell rất giống student workspace
- supporter tái dùng `WorkspaceSidebar`, `CaseStatusHeader`, `TabDiscussionChat`, `ActivityTimeline`, `DocumentWorkspace`
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

### 4.1 Auth, session, authorization
- auth/session thuộc `apps/api`
- Better Auth mount qua `/api/auth/*`
- middleware và authorization layer ở backend gate dashboard, supporter, admin surfaces theo role + case membership
- frontend không tự định nghĩa access policy riêng

### 4.2 Case workflow
- backend cung cấp endpoints cho case detail, message thread, status update, settings update, payment, admin triage, supporter actions
- frontend không sở hữu workflow semantics; frontend chủ yếu map và trình bày

### 4.3 Report workflow
- supporter review page làm việc với draft report và approve/send flow
- report là output chính thức của supporter, không để chat thay vai trò này

### 4.4 Document workflow
- backend documents module đã encode document workspace theo checkpoint/version/assessment
- contract mới được expose theo kiểu additive từ case detail payload, giữ tương thích với field cũ
- document type và document record đã có module riêng trong backend

## 5. Case workspace data flow

### 5.1 Case details
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
  - `document_workspace`

Điều này cho thấy payload case detail đang mang cả field cũ lẫn contract mới cho document workspace.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`

### 5.2 Chat / discussion
`useCaseChat(caseId)` hiện:
- GET `/cases/:id/messages`
- POST `/cases/:id/messages`
- polling mỗi 5 giây
- invalidate query sau khi gửi

Đây là text chat bằng REST + polling, không phải realtime socket.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseChat.ts`
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`

### 5.3 Timeline / activity log
- `ActivityTimeline` đọc `caseData.events`
- timeline hiện map nhiều event_type sang label UI
- timeline là lớp truy vết user-facing cho case progression

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`
- `apps/web-1/types/case.ts`

### 5.4 Document workspace
`DocumentWorkspace` hiện:
- nhận `document_workspace` từ case detail payload
- cho chọn checkpoint khi case có nhiều checkpoint
- render các tab `overview`, `documents`, `external-feedback`
- tách tài liệu support flow và tài liệu đánh giá bên ngoài

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx`
- `apps/api/src/modules/documents/domain/document-contract.ts`

## 6. Data model bề mặt frontend đáng chú ý

### 6.1 Case
`Case` hiện đã có:
- `user_facing_stage`
- `internal_status`
- `payment_status`
- `messages`
- `events`
- `checkpoints`
- `payments`
- `lifecycle_units`
- `reports`

Điều này cho thấy workspace hiện tại đã bám model giàu hơn nhiều so với form submit đơn giản.

Tham chiếu:
- `apps/web-1/types/case.ts`

### 6.2 Message
`CaseMessage` hiện gồm:
- `sender_auth_user_id`
- `sender_role_snapshot`
- `content`
- `created_at`
- optional `sender`

### 6.3 Event
`CaseEvent` hiện gồm:
- `event_type`
- `actor_auth_user_id`
- optional links tới document/report/audit_round/payment/meeting
- `metadata_json`
- `created_at`

### 6.4 Intake document
`IntakeDocument` hiện gồm:
- `source_type: "drive" | "upload"`
- `drive_url?`
- `file_url?`
- `document_type`
- `role_description`

Tham chiếu:
- `apps/web-1/app/dashboard/intake/_types/intake.types.ts`

### 6.5 Additive document workspace contract
`document_workspace` hiện encode:
- `selected_checkpoint_id`
- `checkpoints[]`
- `overview`
- `version_units[]`
- `assessment_units[]`
- `support_flow_documents[]`
- `external_feedback_documents[]`

Đây là layer mới hơn so với `document_board_sections` và `round_history`, nhưng đang cùng tồn tại để giữ tương thích.

Tham chiếu:
- `apps/api/src/modules/documents/domain/document-contract.ts`

## 7. Document intake model hiện trạng

Current intake UI không phải multi-document manager đầy đủ.

Nó hiện hoạt động như sau:
- dùng `documents[0]` như primary document bundle;
- yêu cầu user nộp 1 Drive/Docs URL chính;
- user tick checklist loại tài liệu có trong thư mục;
- UI tạo summary string cho `document_type` và `role_description`;
- template helper hỗ trợ nhóm chuẩn bị hồ sơ nhanh hơn.

Điều này nghĩa là intake document model hiện là hybrid sơ khai, trong khi downstream case workspace đã giàu hơn nhiều.

Tham chiếu:
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`
- `apps/web-1/app/dashboard/intake/hooks/useIntakeForm.ts`

## 8. Role boundaries

### Student
- tạo case
- xem case workspace
- theo dõi tài liệu, timeline, status, payment state
- chat với supporter/admin nếu luồng cho phép
- xem report và nộp revision

### Supporter
- mở case workspace cùng shell
- xem context, tài liệu, timeline, chat
- vào review page để tạo hoặc chỉnh báo cáo phản biện

### Admin
- triage, reject, request more info, approve
- assign hoặc reassign supporter

## 9. Architectural constraints cho MVP demo

- Không nên refactor backend workflow trước demo.
- Không nên thay schema tài liệu lớn trước demo.
- Không nên giới thiệu websocket/realtime claims nếu code chưa có.
- Không nên mô tả intake upload flow như đã hoàn chỉnh nếu UI vẫn thiên về Drive link + checklist.
- Không nên phá shared workspace shell; đây là lợi thế hiện tại của codebase.
- Không nên để payment lấn narrative chính của audit/review flow, dù payment vẫn là surface thật.

## 10. Architectural direction ngắn hạn đã chốt

- Giữ nguyên shell và route structure hiện tại.
- Dùng semantic/UX realignment để làm rõ narrative.
- Dùng shared frontend mapping cho status nếu khả thi.
- Xem document workspace là bề mặt trung tâm để hiểu hồ sơ và revision rounds.
- Xem text chat là coordination path.
- Xem timeline là continuity/trust layer.
- Xem report là output chính thức của supporter.

## 11. Những gì chưa nên hứa trong tài liệu

Không ghi như thể đã có sẵn:
- realtime chat bằng socket;
- intake document ingestion file-by-file hoàn chỉnh;
- event sourcing đầy đủ;
- document version manager hoàn chỉnh cho mọi artifact ngoài scope hiện tại;
- automation AI mới chưa tồn tại trong luồng hiện tại.
