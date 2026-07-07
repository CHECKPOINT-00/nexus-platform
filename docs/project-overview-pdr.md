# Project Overview PDR

## 1. Mục tiêu tài liệu

Tài liệu này chốt product direction ngắn hạn cho MVP demo Nexus sau khi đối chiếu codebase hiện tại.

Mục tiêu: giữ MVP bám pain hiện tại của khách hàng EXE101/FPT, tận dụng tối đa những gì codebase đã có, tránh rewrite lớn trước demo.

## 2. Product thesis ngắn gọn

Nexus không nên được demo như cổng quản lý hồ sơ chung chung.

Nexus nên được demo như workflow hỗ trợ phản biện có cấu trúc:
- sinh viên tạo `Hồ sơ phản biện`;
- hệ thống ghi nhận bối cảnh, nhu cầu hỗ trợ, và tài liệu minh chứng;
- admin triage và phân công nhanh;
- supporter đọc cùng một case workspace, theo dõi tài liệu theo checkpoint, trao đổi khi cần, biên tập báo cáo phản biện, và theo dõi các vòng sửa.

## 3. Customer-facing framing đã chốt

Thuật ngữ chính cho demo:
- `Hồ sơ phản biện`
- `Nhu cầu hỗ trợ`
- `Tài liệu minh chứng`
- `Trao đổi & phản hồi`
- `Báo cáo phản biện`

Không nên để customer-facing surfaces nói nhiều giọng như:
- case / project / intake / idea / report theo cách mâu thuẫn nhau;
- internal status lộ thẳng ra màn student nếu không được map lại.

## 4. Vấn đề cũ cần sửa trước demo

### 4.1 Mâu thuẫn story
- Intake hiện thiên về form-first wording.
- Hành vi thật của user lại thiên về document-first / Drive-first.
- Student, admin, supporter chưa luôn kể cùng một câu chuyện.

### 4.2 Mâu thuẫn về trọng tâm
- Product value thật nằm ở giảm ambiguity và tăng tốc handoff.
- Workspace hiện đã có document workspace và report/revision loop rõ hơn chat đơn thuần.
- Một số màn vẫn dễ bị hiểu là thu form hoặc quản lý project.

### 4.3 Mâu thuẫn về narrative trong workspace
- Student workspace, supporter workspace, admin triage đều đã có nền khá tốt.
- Nhưng labels, status story, và thứ tự nhấn mạnh chưa đủ đồng bộ để demo mạch.

## 5. Những gì codebase đã có thật

Các quyết định sau đây phải bám code hiện tại, không giả định lại từ đầu.

### 5.1 Shared case workspace shell
- Student case workspace đã có sidebar shell.
- Supporter case workspace tái dùng cùng shell.
- Student hiện ưu tiên `documents`, `discussion`, `timeline`, `settings`.
- Supporter tái dùng shell và có review page riêng.
- Đây là hướng UX chính cần giữ.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`

### 5.2 Document workspace đã là first-class surface
- `DocumentWorkspace` đã có checkpoint selector.
- Trong mỗi checkpoint đã có `overview`, `documents`, `external-feedback`.
- Workspace đã phản ánh model `checkpoint -> version -> assessment` rõ hơn intake form ban đầu.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx`
- `apps/api/src/modules/documents/domain/document-contract.ts`

### 5.3 Chat text cơ bản đã có
- `TabDiscussionChat.tsx` đã fetch message list, render thread, gửi message mới.
- `useCaseChat.ts` dùng GET/POST REST và polling 5 giây.
- Chat chưa phải realtime socket. Nó là coordination surface, không phải trung tâm duy nhất của product story.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseChat.ts`

### 5.4 Activity timeline đã có
- Workspace đã có `ActivityTimeline`.
- Timeline đọc `caseData.events` và render các event chính như create case, payment, report, clarification.
- Đây là nền để demo continuity và traceability.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`

### 5.5 Supporter review flow đã có
- Supporter đã có workspace riêng để đọc case.
- Supporter đã có review page riêng để generate draft AI, chỉnh findings, và approve/send report.
- Đây là output path chính thức cho báo cáo phản biện.

Tham chiếu:
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`

### 5.6 Intake và Document Workspace qua document_records
- Hệ thống hỗ trợ nộp và quản lý hồ sơ theo định hướng minh chứng/tài liệu trước (profile/evidence-first).
- `DocumentWorkspace` quản lý các tài liệu minh chứng (`Tài liệu minh chứng`) thông qua cơ chế tải lên trực tiếp và quản lý bản ghi tài liệu bằng bảng `document_records` trong database thay vì chỉ sử dụng liên kết checklist Google Drive.
- Hỗ trợ lưu trữ các file tài liệu đính kèm, phân loại theo checkpoint, hướng nộp, và phân chia quyền/uploader rõ ràng.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx`
- `apps/api/src/modules/documents/domain/document-contract.ts`

### 5.7 Payment & Admin Pricing Configuration (F07)
- Tính năng thanh toán hoạt động đầy đủ: Case workspace tích hợp Banner cảnh báo chưa thanh toán, trang upload minh chứng thanh toán (Payment Proof Upload) kết hợp lưu public URL ảnh hóa đơn/biên lai lên Cloudinary.
- Admin Pricing: Tích hợp đầy đủ trang cấu hình các gói dịch vụ Admin (`AdminPackagesSettings.tsx`) thông qua API cập nhật đơn giá (`PUT /api/admin/packages/:id/price`) và hooks `useAdminPackages`.
- Price Locking: Khi một hồ sơ được khởi tạo, hệ thống tự động khóa đơn giá hiện tại (`Case.locked_price`), giúp bảo vệ khách hàng khỏi sự thay đổi giá đột ngột và lưu lại lịch sử thay đổi giá (`previous_price`, `last_price_changed_at`, `last_price_changed_by`).

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/payment/page.tsx`
- `apps/web-1/app/admin/_components/AdminPackagesSettings.tsx`
- `apps/web-1/lib/pricing.ts`
- `apps/web-1/types/case.ts`

## 6. MVP demo core đã chốt

### 6.1 Student
- tạo tài khoản / đăng nhập;
- tạo `Hồ sơ phản biện` (cổng tiếp nhận định hướng hồ sơ/minh chứng - profile/evidence-first);
- điền bối cảnh, nhu cầu hỗ trợ, thông tin liên hệ, xác nhận cần thiết;
- trực tiếp tải lên các tài liệu minh chứng qua Document Uploader và quản lý qua hệ thống `document_records`;
- vào case workspace để theo dõi tài liệu, trạng thái, timeline, trao đổi, báo cáo, và vòng sửa.

### 6.2 Admin
- xem case mới;
- đọc nhanh summary, needs, documents;
- yêu cầu làm rõ / từ chối / duyệt;
- quản lý giá gói dịch vụ và xem audit trail thay đổi giá;
- phân công supporter.

### 6.3 Supporter
- mở cùng case workspace shell;
- đọc context và tài liệu của case theo checkpoint;
- trao đổi với sinh viên khi cần;
- tạo hoặc biên tập báo cáo phản biện;
- gửi phản hồi, yêu cầu bổ sung, theo dõi timeline.

## 7. Những gì phải giữ

- Giữ sidebar workspace pattern.
- Giữ document workspace như bề mặt trung tâm của hồ sơ (quản lý qua `document_records`).
- Giữ chat text đơn giản như coordination path.
- Giữ timeline/event trace.
- Giữ dynamic upload và pricing config.
- Giữ shared shell giữa student và supporter.
- Giữ review page riêng của supporter.

## 8. Những gì phải sửa

### 8.1 Narrative và labels
- Đồng bộ toàn bộ wording quanh `Hồ sơ phản biện`.
- Làm rõ current state + next action cho student.
- Làm admin summary đọc như triage surface, không chỉ là dump field.
- Điều chỉnh student detail / supporter surfaces để không quay về story `ý tưởng dự án` cũ.

### 8.2 Intake framing
- Intake phải đọc như quy trình tạo hồ sơ hỗ trợ thật, định hướng minh chứng/tài liệu trước (profile/evidence-first).
- Documents phải được nhấn là evidence chính của hồ sơ.
- Review/submit phải kể được câu chuyện: vấn đề -> hỗ trợ cần -> bằng chứng -> kết quả mong muốn.

### 8.3 Status coherence
- Dùng shared frontend mapping nếu khả thi.
- Không đổi semantic backend status model trước demo.
- Tránh lộ internal status cho user theo cách khó hiểu.

### 8.4 Workspace emphasis
- Document workspace phải được xem là bề mặt trung tâm để hiểu case và revision rounds.
- Discussion/chat là kênh phối hợp chính, không phải source of truth duy nhất.
- Timeline dùng để chứng minh continuity.
- Report là output chính thức của supporter, không để chat thay report.

## 9. Những gì phải bỏ hoặc hoãn

Không làm trước demo:
- backend workflow/status refactor;
- subsystem chat realtime bằng socket;
- AI parsing pipeline tự động hóa hoàn toàn mới;
- supporter/admin redesign lớn;
- các tính năng thanh toán tự động (Cổng thanh toán ngân hàng tự động).

## 10. Demo path mục tiêu

1. Sinh viên tạo `Hồ sơ phản biện` (cổng tiếp nhận profile/evidence-first).
2. Sinh viên mô tả rõ đang mắc ở đâu và cần hỗ trợ gì (`Nhu cầu hỗ trợ`).
3. Sinh viên nộp tài liệu minh chứng trực tiếp bằng upload hoặc liên kết.
4. Admin vào triage, hiểu case rất nhanh, duyệt hoặc yêu cầu làm rõ.
5. Supporter mở cùng workspace, đọc tài liệu theo checkpoint, trao đổi khi cần, biên tập báo cáo phản biện (`Báo cáo phản biện`).
6. Sinh viên nhận báo cáo, theo dõi timeline, và có thể nộp revision (`Vòng phản biện/Revision rounds`).

## 11. Acceptance criteria cho bản demo

- Trong 30 giây đầu, audience hiểu `Hồ sơ phản biện` là gì.
- Trong 2–3 phút, audience thấy rõ `student -> admin -> supporter` là workflow thống nhất.
- Student workspace, admin triage, supporter workspace không mâu thuẫn terminology.
- Document workspace đọc ra được lịch sử checkpoint và tài liệu chính.
- Chat text hoạt động đủ ổn để dùng như kênh trao đổi chính.
- Timeline đủ rõ để nhìn ra case đã đi đến đâu.
- Presenter không phải giải thích vòng vo vì wording mơ hồ.

## 12. Quy tắc triển khai tiếp theo

- Tận dụng tối đa code path đã có.
- Ưu tiên semantic/UX realignment hơn subsystem redesign.
- Mọi tài liệu và plan sau tài liệu này phải ghi rõ cái gì đã được code xác nhận, cái gì còn deferred.
