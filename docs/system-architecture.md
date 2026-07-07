# System Architecture

## 1. Mục tiêu tài liệu

Tài liệu này mô tả architecture hiện trạng phục vụ MVP demo Nexus, bám codebase đang có thay vì mô tả tương lai giả định.

## 2. Kiến trúc tổng quan

Nexus hiện là monorepo Turborepo với 3 vùng chính:
- `apps/web-1`: product frontend Next.js 16 (sử dụng Mantine UI v9 + Tailwind CSS)
- `apps/api`: backend Hono + Better Auth + Prisma
- `packages/ui`: UI primitives dùng chung

Data model trung tâm nằm ở `prisma/schema.prisma` gồm 18 bảng, bao gồm:
- Auth: `users`, `sessions`, `accounts`, `verifications`, `two_factors`
- Core Business & Workflow: `cases`, `case_members`, `checkpoints`, `lifecycle_units`, `document_records`, `document_types`, `reports`, `payments`, `case_messages`, `case_events`, `ai_jobs`
- Refund Module: `refunds`

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

### 3.5 Admin Packages Pricing Settings (F07)
- Admin có trang cấu hình giá gói dịch vụ (`AdminPackagesSettings.tsx`) để cập nhật đơn giá, bật/tắt (is_active) trạng thái hiển thị gói dịch vụ cho khách hàng mới.
- Tích hợp hook `useAdminPackages.ts` chứa các mutation: `updatePackagePrice` và `updatePackageStatus`.

Tham chiếu:
- `apps/web-1/app/admin/_components/AdminPackagesSettings.tsx`
- `apps/web-1/app/admin/hooks/useAdminPackages.ts`

## 4. Backend responsibilities

### 4.1 Auth, session, authorization
- auth/session thuộc `apps/api`
- Better Auth mount qua `/api/auth/*`
- middleware và authorization layer ở backend gate dashboard, supporter, admin surfaces theo role + case membership
- frontend không tự định nghĩa access policy riêng

### 4.2 Case & Pricing Workflow
- Backend cung cấp các endpoint cho case detail, message thread, status update, settings update, payment, admin triage, supporter actions.
- **Admin Packages Configuration (F07)**: API hỗ trợ điều chỉnh giá gói dịch vụ (`PUT /api/admin/packages/:id/price`) và cập nhật trạng thái hiển thị (`PUT /api/admin/packages/:id/status`).
- **Price Locking**: Khi một case được tạo, hệ thống tự động khóa đơn giá hiện tại (`Case.locked_price` và `Case.proposed_locked_price`) để bảo vệ khách hàng khỏi sự thay đổi giá đột ngột, đồng thời ghi lại vết thay đổi giá (`previous_price`, `last_price_changed_at`, `last_price_changed_by`) trên bảng `ServicePackage`.
- Frontend không sở hữu workflow semantics; frontend chủ yếu map và trình bày thông qua các helper tập trung như `@/lib/pricing.ts` (`getCaseEffectivePrice`).

### 4.3 Report workflow
- supporter review page làm việc với draft report và approve/send flow
- report là output chính thức của supporter, không để chat thay vai trò này

### 4.4 Document workflow
- backend documents module đã encode document workspace theo checkpoint/version/assessment
- contract mới được expose theo kiểu additive từ case detail payload, giữ tương thích với field cũ
- document type và document record đã có module riêng trong backend (sử dụng bảng `document_records` để quản lý trực tiếp các file tải lên thay vì liên kết Google Drive).

### 4.5 Refund Module
- API sinh viên: `POST /api/payments/refund` (qua `requestRefundUseCase`): Cho phép gửi yêu cầu hoàn tiền khi hồ sơ đã thanh toán (`payment_status === "paid"`) và chưa có supporter nào được phân công (`assigned_supporter_auth_user_id === null`). Yêu cầu hoàn tiền Tier 1 được khởi tạo tự động hoàn 100% số tiền đã đóng.
- API admin: `GET /api/admin/refunds` (xem danh sách yêu cầu hoàn tiền) và `POST /api/admin/refunds/:id/process` (qua `processRefundUseCase`): Cho phép Admin duyệt (`approve`), từ chối (`reject`, cần lý do tối thiểu 10 ký tự), hoặc hoàn tất chuyển tiền ngoài hệ thống (`complete`, yêu cầu lưu transaction reference và ảnh biên lai thanh toán lên Cloudinary). Trạng thái thanh toán của case được chuyển thành `"refunded"`, stage chuyển thành `"closed"`, và status chuyển thành `"cancelled"`. Cơ chế kiểm tra race condition (`REFUND_TIER_CHANGED`) được thực thi để đảm bảo tính toàn vẹn dữ liệu.

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
- `locked_price`
- `messages`
- `events`
- `checkpoints`
- `payments`
- `lifecycle_units`
- `reports`

Điều này cho thấy workspace hiện tại đã bám model giàu hơn nhiều so với form submit đơn giản.

### 6.2 ServicePackage
`ServicePackage` hiện đã có các trường cấu hình giá và audit trail:
- `price`
- `previous_price`
- `last_price_changed_at`
- `last_price_changed_by`

Tham chiếu:
- `apps/web-1/types/case.ts`
- `apps/web-1/types/package.ts`

### 6.3 Refund
`Refund` model đại diện cho yêu cầu hoàn tiền:
- `id`: Định danh UUID của yêu cầu hoàn tiền.
- `case_id`: Liên kết tới `Case` liên quan.
- `payment_id`: Liên kết tới giao dịch `Payment` gốc.
- `tier`: Cấp độ hoàn tiền (Tier 1 = 100% trước khi gán supporter).
- `amount`: Số tiền hoàn trả.
- `status`: Trạng thái (`requested` | `approved` | `rejected` | `completed`).
- `reason`: Lý do xin hoàn tiền.
- `rejection_reason`: Lý do từ chối (Admin nhập, tối thiểu 10 ký tự).
- `proof_file_url`: Ảnh biên lai/minh chứng hoàn tiền tải lên Cloudinary.
- `bank_transfer_ref`: Mã giao dịch ngân hàng thực tế.
- `requested_by` & `processed_by`: ID người yêu cầu & Admin xử lý.
- `transferred_at` & `processed_at`: Thời gian thực hiện chuyển tiền & phê duyệt.

### 6.3 Message
`CaseMessage` hiện gồm:
- `sender_auth_user_id`
- `sender_role_snapshot`
- `content`
- `created_at`
- optional `sender`

### 6.4 Event
`CaseEvent` hiện gồm:
- `event_type`
- `actor_auth_user_id`
- optional links tới document/report/audit_round/payment/meeting
- `metadata_json`
- `created_at`

### 6.5 Intake document
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
