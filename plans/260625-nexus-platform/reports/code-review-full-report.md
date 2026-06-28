# Code Review Report

Date: 2026-06-28
Method: Verified against current source with CodeGraph and targeted source reads
Scope: Frontend first, backend second

## Verdict

Bản report cũ đúng phần lớn, nhưng không hoàn toàn chính xác.

- 7 finding cũ có cơ sở.
- 1 finding cũ cần sửa phạm vi.
- Có thêm 5 finding mới rõ ràng chưa được nêu.

## Frontend

### 1. [High] Middleware route guard chỉ chặn theo cookie, không chặn theo role
- File: `apps/web-1/proxy.ts:5`
- File: `apps/web-1/proxy.ts:21`
- Vấn đề: middleware chỉ check `better-auth.session_token`, rồi `NextResponse.next()` cho mọi user đã có cookie.
- Tác động: request-level guard không chặn student khỏi `/admin` hoặc `/supporter`.
- Ghi chú xác minh: supporter pages hiện vẫn có client-side role redirect riêng, nên report cũ đúng ở mức middleware, nhưng diễn đạt quá rộng nếu hiểu là toàn frontend không có role guard.

### 2. [Medium] Intake draft restore không rehydrate TanStack Form state
- File: `apps/web-1/app/dashboard/intake/hooks/useIntakeForm.ts:55`
- File: `apps/web-1/app/dashboard/intake/hooks/useIntakeForm.ts:67`
- File: `apps/web-1/app/dashboard/intake/hooks/useIntakeForm.ts:96`
- Vấn đề: `draftValues` được cập nhật sau mount bằng `setDraftValues`, nhưng `useForm({ defaultValues })` chỉ lấy snapshot lúc khởi tạo.
- Tác động: draft từ `localStorage` có thể không phản ánh vào state thật của form.
- Kỳ vọng: gọi `form.reset(parsedDraft)` sau khi load draft thành công.

### 3. [Medium] Review editor dễ lệch state khi xóa hoặc thêm finding
- File: `apps/web-1/app/supporter/case/[id]/review/page.tsx:216`
- File: `apps/web-1/app/supporter/case/[id]/review/page.tsx:218`
- File: `apps/web-1/app/supporter/case/[id]/review/_components/FindingCard.tsx:34`
- Vấn đề: render list bằng `key={index}`, trong khi mỗi `FindingCard` giữ local state `editedFinding`.
- Tác động: xóa hoặc chèn item có thể làm React reuse sai instance, dẫn tới state chỉnh sửa dính sang card khác.
- Kỳ vọng: dùng id ổn định cho finding.

### 4. [Medium] Admin actions nuốt lỗi ở component table
- File: `apps/web-1/app/admin/_components/AdminCaseAssignmentTable.tsx:61`
- File: `apps/web-1/app/admin/_components/AdminCaseAssignmentTable.tsx:74`
- File: `apps/web-1/app/admin/_components/AdminCaseAssignmentTable.tsx:83`
- File: `apps/web-1/app/admin/_components/AdminCaseAssignmentTable.tsx:94`
- File: `apps/web-1/app/admin/_components/AdminCaseAssignmentTable.tsx:105`
- Vấn đề: `handleAcceptClick`, `handleRejectSubmit`, `handleInfoRequestSubmit`, `handleAssignSubmit` đều `catch {}`. `handleViewDetails` chỉ `console.error`.
- Tác động: nếu callback cha không tự báo lỗi, UI ở component này im lặng và modal/state loading dễ gây hiểu nhầm.
- Ghi chú xác minh: page cha hiện có `alert` cho vài action, nên report cũ đúng về local error handling của component, nhưng tác động phụ thuộc caller.

### 5. [High] Upload payment proof gửi sai tên field `caseId`, backend đợi `case_id`
- File: `apps/web-1/app/dashboard/case/[id]/hooks/usePaymentUpload.ts:12`
- File: `apps/web-1/app/dashboard/case/[id]/hooks/usePaymentUpload.ts:17`
- File: `apps/api/src/modules/payments/presentation/http/payments.routes.ts:55`
- Vấn đề: frontend append `caseId` vào `FormData`, backend đọc `body["case_id"]`.
- Tác động: upload proof sẽ bị backend coi là thiếu `case_id` và trả `400`.
- Kỳ vọng: thống nhất tên field multipart.

## Backend

### 6. [High] Upload minh chứng thanh toán không kiểm ownership hoặc membership
- File: `apps/api/src/modules/payments/presentation/http/payments.routes.ts:46`
- File: `apps/api/src/modules/payments/presentation/http/payments.routes.ts:75`
- Vấn đề: route chỉ check có session. Không verify user là owner/member của case trước khi tạo payment proof.
- Tác động: bất kỳ user đã đăng nhập nào biết `case_id` đều có thể upload proof cho case khác.
- Kỳ vọng: check owner/member/admin rõ ràng trước khi ghi DB.

### 7. [High] Report routes cho supporter không check case assignment hoặc resource ownership
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:14`
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:121`
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:149`
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:173`
- Vấn đề: các route draft, edit, approve chỉ check role `supporter|admin`, không check supporter có được assign vào case hay report đó hay không.
- Tác động: supporter bất kỳ có thể tạo, đọc, sửa, publish report của case không thuộc mình.
- Kỳ vọng: supporter phải bị giới hạn theo `assigned_supporter_auth_user_id`; admin mới được toàn quyền.

### 8. [High] Latest approved report có thể bị lộ cho bất kỳ user đã đăng nhập
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:230`
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:251`
- Vấn đề: `GET /api/reports/:caseId/latest` chỉ check session, không check user có quyền với case đó.
- Tác động: user bất kỳ có thể đọc report APPROVED của case khác nếu đoán được `caseId`.
- Kỳ vọng: dùng cùng access rule như `GET /api/cases/:id`.

### 9. [High] Chat routes không kiểm quyền truy cập case
- File: `apps/api/src/modules/cases/presentation/http/cases.routes.ts:600`
- File: `apps/api/src/modules/cases/presentation/http/cases.routes.ts:624`
- Vấn đề: `GET /:id/messages` và `POST /:id/messages` chỉ check session, không check owner/member/supporter/admin với case đó.
- Tác động: lộ lịch sử chat và cho phép gửi tin nhắn vào case không thuộc quyền user.
- Kỳ vọng: áp dụng cùng access guard như route `GET /:id`.

### 10. [High] AI draft report map sai schema intake, làm prompt mất dữ liệu thật
- File: `apps/api/src/modules/cases/presentation/http/cases.routes.ts:226`
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:59`
- File: `apps/api/src/modules/reports/presentation/http/reports.routes.ts:60`
- File: `apps/api/src/services/ai.ts:45`
- File: `apps/api/src/services/ai.ts:54`
- Vấn đề: intake được lưu nguyên `body` CP1. Nhưng route generate draft lại map sang `idea/customer/pain_point/...`. Schema CP1 hiện dùng `case_summary`, `current_situations`, `support_needs`, `documents`, `expected_outputs`.
- Tác động: nhánh fallback trong AI service gần như không nhận được dữ liệu thật, nên draft AI có thể rất nghèo thông tin hoặc sai ngữ cảnh.
- Kỳ vọng: truyền nguyên object intake hiện tại, hoặc map đúng schema CP1.

### 11. [High] Payment approve lưu `verified`, không khớp status frontend đang dùng
- File: `apps/api/src/modules/payments/presentation/http/payments.routes.ts:173`
- File: `apps/web-1/types/payment.ts:10`
- Vấn đề: backend lưu `verified` khi admin approve, frontend model và UI admin lại dùng `paid | pending_verification | rejected`.
- Tác động: payment đã duyệt có thể render sai nhánh, sai filter, sai badge.
- Kỳ vọng: dùng enum chung. Nếu case status đã chuyển sang `paid`, payment row cũng phải cùng vocabulary.

### 12. [Medium] Payment create path có thể persist `package_id` rỗng
- File: `apps/api/src/modules/payments/presentation/http/payments.routes.ts:108`
- Vấn đề: route create payment dùng `caseObj.package_id || ""`.
- Tác động: nếu case không có package hợp lệ, route vẫn cố insert giá trị rỗng và phụ thuộc hoàn toàn vào DB constraint để fail.
- Kỳ vọng: reject sớm bằng `400` hoặc dùng `null` nếu schema cho phép.

### 13. [Medium] Report cũ nêu sai phạm vi về guard của case routes
- File: `apps/api/src/modules/cases/presentation/http/cases.routes.ts:278`
- File: `apps/api/src/modules/cases/presentation/http/cases.routes.ts:329`
- File: `apps/api/src/modules/cases/presentation/http/cases.routes.ts:657`
- File: `apps/api/src/modules/cases/presentation/http/cases.routes.ts:681`
- Vấn đề: report cũ nghi ngờ cả `GET /:id` và `PUT /:id/settings`. Hai route này thực tế đã có check owner/member/supporter/admin.
- Tác động: finding cũ gây nhiễu, vì route hở thật là message routes chứ không phải mọi route case detail/settings.
- Kỳ vọng: tách finding theo route cụ thể, không gom mơ hồ.

## Summary

- Report cũ đúng phần lớn, nhưng cần sửa lại finding về case access.
- Có thêm 5 finding mới đáng ưu tiên: upload multipart key mismatch, report routes thiếu resource auth, latest report leak, chat routes thiếu auth theo case, AI draft map sai schema intake.
- No unit tests run.
- No e2e review.
