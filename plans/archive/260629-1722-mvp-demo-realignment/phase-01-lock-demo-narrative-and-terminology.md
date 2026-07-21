# Phase 01 — Lock demo narrative and terminology

## Context links
- Parent plan: `./plan.md`
- Research: `./research/researcher-01-demo-path-report.md`
- Research: `./research/researcher-02-ops-path-report.md`
- Synthesis: `./reports/planner-synthesis-report.md`
- Docs: `../../docs/codebase-summary.md`, `../../docs/code-standards.md`

## Overview
- Date: 2026-06-29
- Description: Chốt narrative demo và bộ thuật ngữ dùng xuyên suốt student/admin/supporter.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Mâu thuẫn lớn nhất trước demo là story, không phải kiến trúc.
- Product hiện nói nhiều giọng: case/project/report/intake.
- Demo cần một từ khóa customer-facing duy nhất: `Hồ sơ phản biện`.

## Requirements
- Dùng wording bám EXE101/FPT.
- Không đổi logic nghiệp vụ lớn.
- Tất cả màn hình demo path phải nói cùng một câu chuyện.
- Chat/discussion phải được gọi và trình bày như một coordination surface cốt lõi, không phải phần phụ.
- Không để customer-facing surfaces lẫn lộn giữa `case`, `project`, `idea`, `report`, `intake` theo cách mâu thuẫn.

## Architecture
- Presentation-layer alignment only.
- Ưu tiên copy, labels, section headings, help text, review summaries.
- Lock cả role-facing wording rules: student-facing, admin triage-facing, supporter-facing.
- Dùng chat/timeline labels như một phần của cùng narrative thay vì hai feature đứng riêng.

## Related code files
- `apps/web-1/app/dashboard/intake/_components/IntakeChatFlow.tsx`
- `apps/web-1/app/dashboard/intake/_components/IntakeProgressStepper.tsx`
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`

## Implementation Steps
1. Chốt glossary demo: hồ sơ phản biện, nhu cầu hỗ trợ, tài liệu minh chứng, supporter, phản hồi.
2. Chốt narrative guardrails: không để nhiều product nouns cạnh tranh nhau trong cùng demo path.
3. Audit các label customer-facing trong intake, case card, case detail header, workspace sidebar, discussion, timeline.
4. Audit admin/supporter-facing labels xem chỗ nào cần đơn giản hóa nhưng vẫn đúng nghiệp vụ.
5. Ghi mapping status labels thống nhất trước khi sửa UI.
6. Ghi role-facing wording rules cho student/admin/supporter để phase sau sửa UI không lệch giọng.

## Todo list
- [ ] Chốt glossary ngắn cho demo
- [ ] Xác định các label mâu thuẫn hiện tại
- [ ] Xác định status labels mục tiêu
- [ ] Chuẩn bị danh sách text/UI cần sửa

## Success Criteria
- Người xem không gặp thuật ngữ mâu thuẫn trong demo path chính.
- Customer-facing surfaces dùng nhất quán `Hồ sơ phản biện`.
- Admin/supporter hiểu case intent nhanh hơn.

## Risk Assessment
- Risk thấp nếu chỉ đổi copy.
- Risk trung bình nếu vô tình chạm logic phụ thuộc string hiển thị.

## Security Considerations
- Không thay auth/session.
- Không đưa wording lộ tài nguyên nội bộ ngoài scope EXE101/FPT đã chấp nhận.

## Next steps
- Sang phase 02 để chỉnh intake và review flow theo narrative đã chốt.
