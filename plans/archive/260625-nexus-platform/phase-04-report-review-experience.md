# Phase 4: Report Review Experience

## Goal
Xây dựng giao diện kiểm duyệt báo cáo dành cho Supporter (`/supporter/case/[id]/review`), giúp supporter đọc, chỉnh sửa nhanh chóng báo cáo do AI tự động tạo (AI Draft) và phê duyệt gửi cho học viên bằng TanStack Query.

## User Outcome
- Supporter phê duyệt báo cáo nhanh chóng nhờ cấu trúc lỗi phân loại khoa học và công cụ chỉnh sửa trực tiếp (inline editor) trực quan.
- Học viên nhận được báo cáo phản biện có tính xây dựng, có căn cứ rõ ràng từ AI đã được kiểm duyệt bởi con người.

## Scope
- Trang phê duyệt và hiệu chỉnh báo cáo của Supporter `/supporter/case/[id]/review`.

## Key Files & Directories to Build
- **Supporter Review Page**: `apps/web-1/app/supporter/case/[id]/review/page.tsx`
  - Private components:
    - `FindingCard.tsx` (Hiển thị điểm phản biện dạng 2D phẳng, chỉ báo mức độ nghiêm trọng và hỗ trợ toggle sửa trực tiếp)
    - `FindingEditor.tsx` (Khung nhập liệu chỉnh sửa nội dung lỗi, lý do hoặc câu hỏi làm rõ)
    - `DisclaimerBanner.tsx` (Tuyên bố trách nhiệm nhẹ nhàng ở đầu và cuối báo cáo)
    - `ReviewActionsPanel.tsx` (Khối điều khiển chứa nút lưu nháp và nút duyệt gửi chính thức)
  - Private hooks:
    - `useReportReview.ts` (quản lý state fetching nháp `GET /api/reports/:caseId/draft`, cập nhật nháp `PUT /api/reports/:id` và duyệt gửi `POST /api/reports/:id/approve` bằng TanStack Query)

## UX Direction
- **Cấu trúc rõ ràng, dễ giải thích**: AI draft không hiển thị dưới dạng một khối văn bản dài. Mỗi điểm phản biện (Finding) được tổ chức thành cấu trúc 6 phần bắt buộc:
  1. *Phần bị lỗi (Field)* (Ví dụ: khách hàng mục tiêu, giải pháp thay thế).
  2. *Trạng thái (Status)* (Ví dụ: Thiếu thông tin, Chưa rõ ràng).
  3. *Bằng chứng (Evidence)* (Trích dẫn trực tiếp từ tài liệu nộp của học viên).
  4. *Lý do (Reason)* (Lập luận tại sao bị đánh giá như vậy).
  5. *Câu hỏi (Question)* (Câu hỏi làm rõ cụ thể cho học viên).
  6. *Hành động tiếp theo (Next Action)* (Gợi ý sửa đổi).
- **Trải nghiệm kiểm duyệt nhanh**: Tách biệt rõ ràng chế độ xem (Read-only) và chế độ sửa (Editor). Cho phép Supporter click sửa trực tiếp từng phần của Finding hoặc loại bỏ Finding không hợp lý.
- **Tuyên bố trách nhiệm**: Hiển thị banner nhẹ nhàng ở đầu và cuối báo cáo: *"Phân tích này được thực hiện tự động bởi AI dựa trên tiêu chí Checkpoint. Supporter đã kiểm duyệt nội dung trước khi gửi để đảm bảo gợi ý sát thực tế nhất."*

## Implementation Steps
1. Xây dựng hook `useReportReview.ts` quản lý các queries và mutations liên quan đến report nháp.
2. Dựng giao diện xem trước báo cáo với cấu trúc FindingCard chia rõ các mục Field-Status-Evidence-Reason-Question-Next action.
3. Tích hợp tính năng chuyển đổi chế độ xem/sửa (Inline Edit) cho supporter trên từng FindingCard sử dụng TanStack Form thu gọn hoặc control state.
4. Liên kết API lấy báo cáo nháp, lưu chỉnh sửa của supporter và gửi yêu cầu phê duyệt.
5. Đặt DisclaimerBanner ở đầu và cuối trang báo cáo.

## Acceptance Criteria
- Supporter có thể chỉnh sửa bất kỳ nội dung nào trong 6 trường của điểm phản biện và lưu lại.
- Báo cáo sau khi phê duyệt sẽ đổi trạng thái thành `APPROVED` và hiển thị trên giao diện của học viên.
- Không có lỗi layout hay tràn chữ (text overflow) trên màn hình trung bình (máy tính bảng và laptop).
