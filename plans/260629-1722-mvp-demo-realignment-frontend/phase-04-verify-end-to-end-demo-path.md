# Phase 04 — Verify end-to-end demo path

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-02-realign-intake-and-submit-flow.md`
- Depends on: `./phase-03-unify-case-status-and-ops-surfaces.md`
- Source parent package: `../260629-1722-mvp-demo-realignment/phase-04-verify-end-to-end-demo-path.md`

## Overview
- Date: 2026-06-29
- Description: Xác minh luồng demo frontend từ student intake đến admin/supporter consumption.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Thành công demo phụ thuộc nhiều vào coherence hơn feature depth.
- Cần verify cả UX message lẫn continuity giữa các màn.
- Synthetic-realistic demo case là bắt buộc để wording đọc thuyết phục.

## Requirements
- Có demo script ngắn, mạch lạc.
- Có dữ liệu case mẫu synthetic nhưng đủ thật.
- Có checklist pass/fail trước ngày demo.
- Có bước verify discussion/chat hoạt động ổn như kênh phối hợp chính.
- Có bước verify student/admin/supporter cùng kể một case story thống nhất.

## Architecture
- Verification and presentation layer only.
- Có thể dùng local run/manual walkthrough.
- Mục tiêu là xác minh clarity và continuity, không audit backend sâu ở phase này.

## Related code files
- `apps/web-1/app/dashboard/intake/page.tsx`
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/page.tsx`
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`
- `apps/web-1/app/supporter/case/[id]/review/page.tsx`

## Implementation Steps
1. Chuẩn bị một hồ sơ demo mẫu synthetic-realistic.
2. Walkthrough student intake và kiểm tra từng step có self-explanatory không.
3. Submit case và kiểm tra dashboard/customer-facing status.
4. Kiểm tra discussion/chat có đọc được, gửi được, polling ổn, wording đủ rõ.
5. Kiểm tra timeline/event wording có giúp audience hiểu case đã đi đến đâu không.
6. Mở admin triage để kiểm tra summary, need, docs đủ rõ chưa.
7. Mở supporter workspace/review để kiểm tra handoff quality.
8. Viết script cuối: nói gì ở mỗi màn, highlight giá trị gì.
9. Chỉ polish những chỗ làm hỏng clarity; không expand scope lớn.

## Todo list
- [ ] Chuẩn bị hồ sơ demo mẫu synthetic-realistic
- [ ] Chạy walkthrough student flow
- [ ] Verify discussion/chat path
- [ ] Verify timeline/event path
- [ ] Chạy walkthrough admin flow
- [ ] Chạy walkthrough supporter flow
- [ ] Viết script trình bày cuối
- [ ] Ghi lại regression/UX issues còn sót

## Success Criteria
- Trong 30 giây đầu, audience hiểu Nexus giải quyết vấn đề gì và `Hồ sơ phản biện` là gì.
- Trong 2–3 phút, audience thấy được luồng hoàn chỉnh và hợp lý.
- Discussion/chat được nhìn như kênh phối hợp chính, không phải tab phụ khó hiểu.
- Không có màn nào buộc presenter phải giải thích vòng vo vì wording mơ hồ.

## Risk Assessment
- Risk thấp nếu các phase trước hoàn tất tốt.
- Risk chính là thiếu dữ liệu demo mẫu đủ thật hoặc continuity giữa các màn chưa khớp.

## Security Considerations
- Dùng dữ liệu demo an toàn, không lộ thông tin nhạy cảm thật.
- Nếu dùng Drive demo, bảo đảm quyền chia sẻ phù hợp môi trường demo.

## Next steps
- Sau verify, nếu còn thời gian thì chọn polish item nhỏ. Không mở rộng scope lớn.