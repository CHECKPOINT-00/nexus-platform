# Project Overview PDR

## 1. Mục tiêu tài liệu

Tài liệu này chốt lại product direction ngắn hạn cho MVP demo Nexus sau các buổi brainstorm và đối chiếu codebase.

Mục tiêu: giữ MVP bám đúng pain hiện tại của khách hàng EXE101/FPT, tận dụng tối đa những gì codebase đã có, tránh rewrite lớn trước demo.

## 2. Product thesis ngắn gọn

Nexus không nên được demo như một cổng quản lý hồ sơ chung chung.

Nexus nên được demo như một workflow hỗ trợ phản biện có cấu trúc:
- sinh viên tạo `Hồ sơ phản biện`;
- hệ thống ghi nhận bối cảnh, nhu cầu hỗ trợ, và tài liệu minh chứng;
- admin triage và phân công nhanh;
- supporter đọc cùng một case workspace, trao đổi trực tiếp với sinh viên, biên tập báo cáo phản biện, và theo dõi các vòng sửa.

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
- Một số màn hiện vẫn dễ bị hiểu là thu form hoặc quản lý project.

### 4.3 Mâu thuẫn về narrative trong workspace
- Student workspace, supporter workspace, admin triage đều đã có nền khá tốt.
- Nhưng labels, status story, và thứ tự nhấn mạnh chưa đủ đồng bộ để demo mạch.

## 5. Những gì codebase đã có thật

Các quyết định sau đây phải bám code hiện tại, không giả định lại từ đầu.

### 5.1 Shared case workspace shell
- Student case workspace đã có sidebar SPA theo tab.
- Supporter case workspace tái dùng cùng shell.
- Đây là hướng UX chính cần giữ.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`

### 5.2 Chat text cơ bản đã có
- `TabDiscussionChat.tsx` đã fetch message list, render thread, gửi message mới.
- `useCaseChat.ts` dùng GET/POST REST và polling 5 giây.
- Chat chưa phải realtime socket, nhưng đã đủ là một core MVP surface.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseChat.ts`

### 5.3 Activity timeline đã có
- Workspace đã có `ActivityTimeline`.
- Timeline đọc `caseData.events` và render các event chính như create case, payment, report, clarification.
- Đây là nền để demo continuity và traceability.

Tham chiếu:
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`

### 5.4 Supporter review flow đã có
- Supporter đã có workspace riêng để đọc case.
- Supporter đã có review page riêng để generate draft AI, chỉnh findings, và approve/send report.

Tham chiếu:
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`

### 5.5 Intake documents đã là hybrid sơ khai
- Intake dùng `documents[0]` làm primary document bundle.
- User hiện đang nộp 1 Drive/Docs URL chính.
- User chọn checklist loại tài liệu có trong thư mục.
- Đây đã là một hybrid model sơ khai, không phải blank slate.

Tham chiếu:
- `apps/web-1/app/dashboard/intake/_types/intake.types.ts`
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`
- `apps/web-1/app/dashboard/intake/hooks/useIntakeForm.ts`

## 6. MVP demo core đã chốt

### 6.1 Student
- tạo tài khoản / đăng nhập;
- tạo `Hồ sơ phản biện`;
- điền bối cảnh, nhu cầu hỗ trợ, thông tin liên hệ, xác nhận cần thiết;
- nộp tài liệu minh chứng qua Drive/Docs link chính + checklist loại tài liệu;
- vào case workspace để theo dõi trạng thái, xem timeline, chat với supporter, nhận báo cáo, nộp revision.

### 6.2 Admin
- xem case mới;
- đọc nhanh summary, needs, documents;
- yêu cầu làm rõ / từ chối / duyệt;
- phân công supporter.

### 6.3 Supporter
- mở cùng case workspace shell;
- đọc context và tài liệu của case;
- chat với sinh viên;
- tạo hoặc biên tập báo cáo phản biện;
- gửi phản hồi, yêu cầu bổ sung, theo dõi timeline.

## 7. Những gì phải giữ

- Giữ sidebar SPA workspace pattern.
- Giữ chat text đơn giản như một core path.
- Giữ timeline/event trace.
- Giữ intake document model hiện tại nếu không thật cần đổi schema.
- Giữ shared shell giữa student và supporter.

## 8. Những gì phải sửa

### 8.1 Narrative và labels
- Đồng bộ toàn bộ wording quanh `Hồ sơ phản biện`.
- Làm rõ current state + next action cho student.
- Làm admin summary đọc như triage surface, không chỉ là dump field.
- Điều chỉnh student detail / supporter surfaces để không quay về story `ý tưởng dự án` cũ.

### 8.2 Intake framing
- Intake phải đọc như quy trình tạo hồ sơ hỗ trợ thật.
- Documents phải được nhấn là evidence chính.
- Review/submit phải kể được câu chuyện: vấn đề -> hỗ trợ cần -> bằng chứng -> kết quả mong muốn.

### 8.3 Status coherence
- Dùng shared frontend mapping nếu khả thi.
- Không đổi semantic backend status model trước demo.
- Tránh lộ internal status cho user theo cách khó hiểu.

### 8.4 Workspace emphasis
- Discussion/chat phải được xem là kênh phối hợp chính giữa student và supporter.
- Timeline phải dùng để chứng minh continuity.
- Report phải là source of truth của phản biện, không để chat thay report.

## 9. Những gì phải bỏ hoặc hoãn

Không làm trước demo:
- document-first schema rewrite lớn;
- backend workflow/status refactor;
- subsystem chat realtime bằng socket;
- upload manager mới hoàn toàn khác intake hiện có;
- supporter/admin redesign lớn;
- AI parsing pipeline mới;
- analytics/config/payment scope expansion nếu không phục vụ trực tiếp demo path.

## 10. Demo path mục tiêu

1. Sinh viên tạo `Hồ sơ phản biện`.
2. Sinh viên mô tả rõ đang mắc ở đâu và cần hỗ trợ gì.
3. Sinh viên nộp Drive folder / main doc cùng checklist tài liệu minh chứng.
4. Admin vào triage, hiểu case rất nhanh, duyệt hoặc yêu cầu làm rõ.
5. Supporter mở cùng workspace, chat khi cần, biên tập báo cáo phản biện.
6. Sinh viên nhận báo cáo, thấy timeline, và có thể nộp revision.

## 11. Acceptance criteria cho bản demo

- Trong 30 giây đầu, audience hiểu `Hồ sơ phản biện` là gì.
- Trong 2–3 phút, audience thấy rõ student -> admin -> supporter là một workflow thống nhất.
- Student workspace, admin triage, supporter workspace không mâu thuẫn terminology.
- Chat text hoạt động đủ ổn để dùng như kênh trao đổi chính.
- Timeline đủ rõ để nhìn ra case đã đi đến đâu.
- Presenter không phải giải thích vòng vo vì wording mơ hồ.

## 12. Quy tắc triển khai tiếp theo

- Tận dụng tối đa code path đã có.
- Ưu tiên semantic/UX realignment hơn là subsystem redesign.
- Mọi tài liệu và plan sau tài liệu này phải ghi rõ cái gì đã được code xác nhận, cái gì còn deferred.
