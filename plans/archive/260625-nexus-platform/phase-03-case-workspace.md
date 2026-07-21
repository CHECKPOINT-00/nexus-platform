# Phase 3: Case Workspace

## Goal
Xây dựng trang Chi tiết Dự án (Case Workspace) – màn hình trung tâm của sản phẩm sử dụng TanStack Query để đồng bộ dữ liệu thời gian thực và quản lý các tab nội dung.

## User Outcome
- Học viên thấy rõ trạng thái hiện tại của dự án, xem báo cáo phản biện chi tiết, trao đổi trực tiếp với supporter, nộp các câu trả lời làm rõ nhanh hoặc chuyển sang phiên bản sửa đổi mới.
- Supporter và Admin có cái nhìn toàn diện về thông tin đầu vào, lịch sử sự kiện và trao đổi của case.

## Scope
- Trang chi tiết dự án `/dashboard/case/[id]` dùng chung cho cả Sinh viên, Supporter và Admin (với phân quyền hiển thị phù hợp).

## Key Files & Directories to Build
- **Case Workspace Page**: `apps/web-1/app/dashboard/case/[id]/page.tsx`
  - Private components: 
    - `CaseStatusHeader.tsx` (thông tin dự án, mã màu trạng thái, đếm ngược SLA và pause logic)
    - `UnpaidAlertBanner.tsx` (cảnh báo chưa thanh toán, nút mở Drawer thanh toán)
    - `PaymentDrawer.tsx` (hướng dẫn chuyển khoản, VietQR động, dropzone tải minh chứng)
    - `VersionSelector.tsx` (chọn phiên bản nộp `v00`, `v01`...)
    - `WorkspaceTabs.tsx` (chia tab Ý tưởng nộp, Báo cáo phản biện, Trao đổi thảo luận)
    - `TabIdeaContent.tsx` (hiển thị nội dung ý tưởng đã nộp)
    - `TabReportFindings.tsx` (danh sách findings dạng accordion/cards, inline reply form)
    - `TabDiscussionChat.tsx` (chat trực tiếp và timeline lịch sử)
    - `ActivityTimeline.tsx` (dòng thời gian lịch sử sự kiện)
  - Private hooks:
    - `useCaseDetails.ts` (lấy thông tin case chi tiết qua `GET /api/cases/:id` bằng TanStack Query)
    - `useCaseChat.ts` (lấy và gửi tin nhắn qua `GET /api/cases/:id/messages` & `POST /api/cases/:id/messages` bằng TanStack Query)
    - `usePaymentUpload.ts` (tải minh chứng thanh toán bằng mutation)

## UX Direction
- **Bố cục rõ ràng**: Tránh nhồi nhét quá nhiều vùng hiển thị cùng lúc trên một màn hình. Sử dụng layout gồm Header tổng quan (hiển thị trạng thái case, đếm ngược SLA, banner thanh toán) + Nội dung chính chia Tab + Bảng điều khiển phụ.
- **Phân lớp dữ liệu**: Tách biệt rõ ràng 3 phần: Ý tưởng đã nộp (Input), Phản biện & Đánh giá (Output/Reports), và Thảo luận (Discussion).
- **Lịch sử phiên bản**: Dropdown cho phép chuyển đổi giữa các bản sửa đổi (`v00`, `v01`, `v02`). Khi chuyển bản cũ, nội dung ý tưởng và report sẽ thay đổi theo phiên bản đó, nhưng khung thảo luận và timeline hoạt động phải được giữ nguyên để bảo toàn mạch trao đổi.
- **Inline Clarification**: Cho phép học viên điền phản hồi trực tiếp ngay bên dưới mỗi câu hỏi phản biện của AI/Supporter để giải thích nhanh, thay vì bắt buộc nộp lại một file lớn.
- **SLA Countdown**: Hiển thị bộ đếm ngược SLA phản hồi 24h-48h rõ ràng. Bộ đếm tự động tạm dừng (Pause) và hiển thị *"Đang chờ học viên làm rõ"* nếu trạng thái case chuyển sang `Need Clarification`.
- **Unpaid Banner**: Nếu case chưa thanh toán (`unpaid`), hiển thị banner màu cam dịu ở đầu workspace kèm nút *"Thanh toán ngay"* để mở ngăn kéo (Drawer) tải ảnh giao dịch, không che chắn hay khóa cứng màn hình.

## Implementation Steps
1. Xây dựng hook `useCaseDetails.ts` để gọi API `GET /api/cases/:id` bằng TanStack Query.
2. Xây dựng hook `useCaseChat.ts` để gọi tin nhắn và gửi tin nhắn bằng query/mutation.
3. Dựng layout tổng quan cho `/dashboard/case/[id]` chia thành Header và hệ thống Tab chính sử dụng component Mantine UI Tabs.
4. Thiết kế `CaseStatusHeader` tích hợp logic đếm ngược SLA (với logic pause khi cần làm rõ) và hiển thị trạng thái động của case.
5. Dựng tab "Ý tưởng nộp" hiển thị dữ liệu intake và link Google Drive.
6. Dựng tab "Báo cáo phản biện" hiển thị các finding có cấu trúc rõ ràng (Field, Status, Evidence, Reason, Question, Next Action), kèm text input cho phép phản hồi làm rõ (Inline Clarification) ngay dưới mỗi finding.
7. Dựng tab "Trao đổi thảo luận" kết nối API chat và panel hiển thị timeline hoạt động của case.

## Acceptance Criteria
- Hiển thị đúng trạng thái case theo mã màu và mô tả rõ ràng.
- Chuyển đổi phiên bản (v00 -> v01) cập nhật đúng nội dung báo cáo tương ứng mà không làm gián đoạn lịch sử chat.
- Bộ đếm ngược SLA hiển thị chính xác và pause đúng lúc khi cần làm rõ.
- Banner unpaid hiển thị đúng lúc và mở được Drawer thanh toán.
