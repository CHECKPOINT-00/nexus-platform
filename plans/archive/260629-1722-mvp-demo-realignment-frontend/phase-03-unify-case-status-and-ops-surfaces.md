# Phase 03 — Unify case status and ops surfaces

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-01-lock-demo-narrative-and-terminology.md`
- Depends on: `./phase-02-realign-intake-and-submit-flow.md`
- Source parent package: `../260629-1722-mvp-demo-realignment/phase-03-unify-case-status-and-ops-surfaces.md`

## Overview
- Date: 2026-06-29
- Description: Đồng bộ cách hiển thị trạng thái và ý nghĩa hồ sơ giữa student/admin/supporter.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Shared sidebar workspace, discussion tab, và timeline đã có thật.
- Admin đã có đủ data triage; vấn đề chính là framing, order, và label.
- Student-facing status đang dễ lộ ngôn ngữ nội bộ.
- Supporter flow không cần đổi lớn nếu upstream story rõ hơn.

## Requirements
- Một status story nhất quán xuyên các màn demo chính.
- Customer biết current state + next action.
- Admin hiểu nhanh need, summary, documents.
- Student và supporter nhìn cùng một case workspace story, chỉ khác quyền và hành động.
- Discussion/chat phải đọc như kênh phối hợp chính.

## Architecture
- UI coherence layer across student, admin, and supporter surfaces.
- Ưu tiên shared constants cho frontend status/display mapping nếu làm nhanh và an toàn được.
- Chỉ đụng mapping, section order, labels, helper copy.
- Không redesign workflow backend.
- Không ép layout chi tiết; chỉ chốt hierarchy và meaning.

## Related code files
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabIdeaContent.tsx`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts`
- `apps/web-1/app/dashboard/case/[id]/hooks/useCaseChat.ts`
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`
- `apps/web-1/types/case.ts`

## Implementation Steps
1. Audit các trạng thái hiện đang lộ ra ở student/admin/supporter.
2. Thiết kế bộ label customer-facing thống nhất.
3. Tạo hoặc chuẩn hóa shared frontend status mapping nếu gọn và an toàn.
4. Đồng bộ CaseCard và CaseStatusHeader theo bộ label đó.
5. Chuẩn hóa WorkspaceSidebar, discussion wording, timeline wording để shared shell kể cùng câu chuyện.
6. Xác nhận `useCaseDetails` và `useCaseChat` hiện có đủ data cho narrative mới.
7. Reorder/làm rõ AdminCaseDetailModal để triage nhanh hơn.
8. Điều chỉnh supporter surfaces cần thiết để narrative demo khớp hoàn toàn.
9. Chỉ chốt what to communicate, not exact visual art direction.

## Todo list
- [ ] Lập bảng mapping trạng thái hiện tại -> trạng thái hiển thị mục tiêu
- [ ] Xác định vị trí shared constants/mapping frontend
- [ ] Chỉnh CaseCard
- [ ] Chỉnh CaseStatusHeader
- [ ] Chỉnh WorkspaceSidebar / discussion / timeline wording
- [ ] Chỉnh AdminCaseDetailModal
- [ ] Chỉnh supporter surfaces liên quan
- [ ] Chỉnh `TabIdeaContent.tsx`

## Success Criteria
- Cùng một hồ sơ nhìn từ dashboard, case detail, admin, supporter đều kể cùng một trạng thái.
- Admin triage được trong vài giây.
- Presenter giải thích ít hơn nhưng flow vẫn rõ.

## Risk Assessment
- Risk trung bình nếu status labels đang gắn cứng ở nhiều nơi.
- Cần tránh đổi semantic backend khi chỉ muốn đổi display.

## Security Considerations
- Không ảnh hưởng quyền truy cập role-based views.
- Không làm lộ internal-only metadata cho customer.

## Next steps
- Sang phase 04 để verify demo path và chốt script trình bày.