# Phase 2: Student Dashboard & Intake

## Goal
Xây dựng giao diện Dashboard trực quan cho sinh viên để quản lý dự án và luồng biểu mẫu nhập liệu dạng đàm thoại có cấu trúc (Structured Conversational Intake) sử dụng TanStack Form và TanStack Query.

## User Outcome
- Sinh viên theo dõi được trạng thái tất cả các dự án của mình và tạo mới dự án một cách dễ dàng thông qua trải nghiệm hướng dẫn từng bước.
- Nhập liệu không bị áp lực như các form dài truyền thống và đảm bảo thông tin liên kết tài liệu Google Drive hợp lệ trước khi gửi.

## Scope
- Trang Dashboard của sinh viên `/dashboard` hiển thị danh sách case và trạng thái.
- Trang Intake hội thoại `/dashboard/intake` hướng dẫn nhập thông tin dự án từng bước.

## Key Files & Directories to Build
- **Dashboard Page**: `apps/web-1/app/dashboard/page.tsx`
  - Private components: `apps/web-1/app/dashboard/_components/CaseCard.tsx`, `apps/web-1/app/dashboard/_components/DashboardEmptyState.tsx`
  - Private hooks: `apps/web-1/app/dashboard/_hooks/useCasesList.ts` (gọi `GET /api/cases` bằng TanStack Query)
- **Intake Flow Page**: `apps/web-1/app/dashboard/intake/page.tsx`
  - Private components: `apps/web-1/app/dashboard/intake/_components/IntakeChatFlow.tsx`, `apps/web-1/app/dashboard/intake/_components/IntakeProgressStepper.tsx`, `apps/web-1/app/dashboard/intake/_components/DriveValidatorInput.tsx`
  - Private hooks: `apps/web-1/app/dashboard/intake/_hooks/useIntakeForm.ts` (quản lý trạng thái form từng bước bằng TanStack Form)
  - Private types: `apps/web-1/app/dashboard/intake/_types/intake.types.ts`

## UX Direction
- **Dashboard**: Thiết kế thân thiện, trực quan. Tránh dùng dạng bảng (Table) enterprise khô cứng. Thay vào đó, sử dụng các Case Card sinh động hiển thị trạng thái và tiến độ.
- **Conversational Intake**:
  - Giao diện chat bong bóng tạo cảm giác được hướng dẫn nhẹ nhàng từng bước. Sử dụng thanh tiến trình (Progress Indicator) để người dùng luôn biết mình đang ở đâu trong các bước câu hỏi.
  - **Giảm tải tư duy**: Câu hỏi của chatbot phải cực kỳ cụ thể (Ví dụ: Thay vì hỏi *"Khách hàng mục tiêu là ai?"*, hỏi *"Ai là người trực tiếp gặp vấn đề này? Họ thuộc nhóm sinh viên nào?"*).
  - **Google Drive Validator**: Kiểm tra định dạng liên kết Drive ngay tại ô nhập liệu client-side và hiển thị lỗi cụ thể bên dưới field nếu thiếu quyền chia sẻ công khai hoặc sai định dạng.
  - **Auto-fill**: Các trường tự động điền (như thông tin cá nhân) có nhãn nhẹ màu xanh lá hoặc xanh dương nhạt để học viên biết *"Thông tin đã được tự động điền"*.
  - Tự động lưu nháp (Local Draft state) bằng LocalStorage đề phòng người dùng tải lại trang làm mất dữ liệu.

## Implementation Steps
1. Xây dựng hook `useCasesList.ts` lấy danh sách case của user hiện tại qua `GET /api/cases`.
2. Dựng giao diện `/dashboard` với Empty State thân thiện và danh sách CaseCard trực quan khi đã có dự án.
3. Xây dựng State machine và hook `useIntakeForm.ts` bằng TanStack Form để quản lý luồng câu hỏi (Stage -> Idea -> Pain Point -> Customer -> Alternatives -> Team Capability -> Drive URL -> Package select).
4. Tích hợp module kiểm tra link Google Drive ở `DriveValidatorInput` bằng regex.
5. Triển khai tính năng tự động lưu nháp tiến độ intake vào `localStorage`.
6. Thực hiện gửi dữ liệu lên `POST /api/cases` bằng mutation của TanStack Query và chuyển hướng học viên trực tiếp về trang chi tiết dự án `/dashboard/case/[id]` sau khi tạo thành công.

## Acceptance Criteria
- Học viên chưa có dự án thấy Empty State hướng dẫn rõ ràng hành động tiếp theo.
- Luồng intake hoạt động mượt mà, chuyển đổi mượt giữa các bong bóng chat.
- Xác thực link Drive hiển thị lỗi ngay lập tức nếu link không đúng định dạng.
- Submit thành công chuyển hướng về đúng workspace của case mới tạo.
