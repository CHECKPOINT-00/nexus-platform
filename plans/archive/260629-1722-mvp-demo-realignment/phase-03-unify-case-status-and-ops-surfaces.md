# Phase 03 — Unify case status and ops surfaces

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-01-lock-demo-narrative-and-terminology.md`
- Depends on: `./phase-02-realign-intake-and-submit-flow.md`
- Research: `./research/researcher-02-ops-path-report.md`
- Synthesis: `./reports/planner-synthesis-report.md`

## Overview
- Date: 2026-06-29
- Description: Đồng bộ cách hiển thị trạng thái và ý nghĩa hồ sơ giữa customer/admin/supporter.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Admin đã có đủ data triage, vấn đề là framing và order.
- Student-facing status đang dễ lộ ngôn ngữ nội bộ.
- Supporter flow không cần đổi lớn nếu upstream rõ hơn.
- Shared sidebar workspace, discussion tab, và timeline đã có thật; phase này phải tận dụng shell hiện hữu thay vì tạo experience mới.
- Chat là core MVP coordination path, nên tab discussion không thể bị xem là phụ trong demo path.

## Requirements
- Một status story nhất quán xuyên các màn demo chính.
- Customer biết current state + next action.
- Admin hiểu nhanh need, summary, documents.
- Student và supporter phải nhìn cùng một case workspace story, chỉ khác quyền và hành động.
- Discussion/chat phải đọc như kênh phối hợp chính giữa student và supporter.

## Architecture
- UI coherence layer across student, admin, and supporter surfaces.
- Ưu tiên một nguồn shared constants cho status/display mapping ở frontend nếu làm nhanh và an toàn được.
- Chỉ đụng mapping/section order/copy nếu có thể.
- Tránh refactor backend status model.
<!-- Updated: Validation Session 1 - shared constants and all three surfaces -->

## Related code files
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabIdeaContent.tsx`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseChat.ts`
- `apps/web-1/types/case.ts`
<!-- Updated: Validation Session 1 - TabIdeaContent moved into scope -->

## Implementation Steps
1. Audit các trạng thái đang hiện ra ở customer/admin/supporter surfaces.
2. Thiết kế một bộ label customer-facing thống nhất.
3. Tạo hoặc chuẩn hóa shared constants cho status/display mapping ở frontend nếu không làm tăng rủi ro lớn.
4. Đồng bộ CaseCard và CaseStatusHeader theo bộ label đó.
5. Chuẩn hóa WorkspaceSidebar, tab labels, discussion wording, timeline wording để shared shell kể cùng một câu chuyện.
6. Xác nhận `useCaseDetails` và `useCaseChat` hiện có đủ data cho narrative mới; chỉ sửa display mapping, labels, order, helper copy.
7. Reorder/làm rõ AdminCaseDetailModal để triage nhanh hơn.
8. Điều chỉnh supporter surfaces cần thiết để narrative demo khớp hoàn toàn.
9. Điều chỉnh `TabIdeaContent.tsx` để student detail view không lệch khỏi story document/support case của demo.
<!-- Updated: Validation Session 1 - all surfaces + shared mapping + TabIdeaContent -->

## Todo list
- [ ] Lập bảng mapping trạng thái hiện tại -> trạng thái hiển thị mục tiêu
- [ ] Xác định vị trí shared constants/mapping frontend
- [ ] Chỉnh CaseCard
- [ ] Chỉnh CaseStatusHeader
- [ ] Chỉnh AdminCaseDetailModal
- [ ] Chỉnh supporter surfaces liên quan
- [ ] Chỉnh `TabIdeaContent.tsx`
<!-- Updated: Validation Session 1 - expanded explicit tasks -->

## Success Criteria
- Cùng một hồ sơ nhìn từ dashboard, case detail, admin đều kể cùng một trạng thái.
- Admin triage được trong vài giây.
- Presenter giải thích ít hơn nhưng flow vẫn rõ.

## Risk Assessment
- Risk trung bình nếu status labels đang gắn cứng ở nhiều nơi.
- Cần tránh đổi semantic backend khi chỉ muốn đổi display.

## Security Considerations
- Không ảnh hưởng quyền truy cập role-based views.
- Không làm lộ thêm internal-only metadata cho customer.

## Next steps
- Sang phase 04 để verify demo path và chốt script trình bày.
