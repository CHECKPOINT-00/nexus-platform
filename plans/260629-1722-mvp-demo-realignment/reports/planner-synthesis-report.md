# Planner synthesis report

## Task
Hoàn thiện lại MVP Nexus trước buổi demo, không implement trong plan này.

## Constraints
- Ưu tiên impact cao, rủi ro thấp.
- Không rewrite lớn trước demo.
- Giữ wording bám EXE101/FPT.
- Thuật ngữ customer-facing chính: `Hồ sơ phản biện`.

## Inputs used
- `docs/codebase-summary.md`
- `docs/code-standards.md`
- `docs/archive/system-architecture.md`
- `plans/260629-1722-mvp-demo-realignment/research/researcher-01-demo-path-report.md`
- `plans/260629-1722-mvp-demo-realignment/research/researcher-02-ops-path-report.md`

## Main conclusion
MVP hiện không cần đổi kiến trúc. Điểm yếu lớn nhất trước demo là story sản phẩm và coherence giữa các màn hình intake → case list/detail → admin triage → supporter consumption.

## Recommended strategy
1. Giữ flow hiện tại.
2. Chỉnh copy, nhãn, thứ tự nhấn mạnh, và status mapping.
3. Làm rõ: vấn đề hiện tại, nhu cầu hỗ trợ, tài liệu minh chứng, kết quả mong muốn.
4. Tránh đụng schema/backend trừ khi có thay đổi hiển thị rất nhỏ và an toàn.

## Highest-impact files
- `apps/web-1/app/dashboard/intake/_components/IntakeChatFlow.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/SituationStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/SupportNeedsStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/ReviewSubmitStep.tsx`
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`

## Deferred items
- Document-first schema rewrite
- Intake state machine rewrite
- Backend status refactor
- AI parsing pipeline changes
- Supporter/admin workflow redesign

## Unresolved questions
- Nếu demo đi sâu vào student case detail tabs, có thể cần follow-up cho `TabIdeaContent.tsx`.
- `docs/project-overview-pdr.md` không tồn tại ở path kỳ vọng; plan này dùng docs hiện có và research reports.
