# Phase 01 — Lock demo narrative and terminology

## Context links
- Parent plan: `./plan.md`
- Source parent package: `../260629-1722-mvp-demo-realignment/phase-01-lock-demo-narrative-and-terminology.md`
- Docs: `../../docs/project-overview-pdr.md`, `../../docs/system-architecture.md`

## Overview
- Date: 2026-06-29
- Description: Chốt bộ từ vựng và narrative guardrails cho toàn bộ frontend demo path.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Mâu thuẫn lớn nhất trước demo là story, không phải kiến trúc.
- Product hiện nói nhiều giọng: case/project/report/intake/idea.
- Frontend cần 1 giọng thống nhất nhưng không bị ép thành 1 layout cứng.
- Chat và timeline đã tồn tại thật, nên wording của chúng phải cùng narrative chung.

## Requirements
- Dùng customer-facing term chính: `Hồ sơ phản biện`.
- Không để customer-facing screens lẫn lộn giữa `case`, `idea`, `project`, `report`, `intake` theo cách mâu thuẫn.
- Student/admin/supporter đọc cùng 1 case story, chỉ khác quyền và hành động.
- Discussion/chat phải được gọi và trình bày như coordination surface cốt lõi.
- Timeline/event wording phải giúp audience hiểu case đang ở đâu.

## Architecture
- Presentation-layer alignment only.
- Ưu tiên copy, labels, section headings, helper text, badge wording.
- Có thể dùng shared frontend constants cho status/display mapping nếu gọn và an toàn.
- Không ép visual treatment chi tiết; chỉ chốt semantic intent và information order.

## Related code files
- `apps/web-1/app/dashboard/intake/_components/IntakeChatFlow.tsx`
- `apps/web-1/app/dashboard/intake/_components/IntakeProgressStepper.tsx`
- `apps/web-1/app/dashboard/_components/CaseCard.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/CaseStatusHeader.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/TabDiscussionChat.tsx`
- `apps/web-1/app/dashboard/case/[id]/_components/ActivityTimeline.tsx`
- `apps/web-1/app/admin/_components/AdminCaseDetailModal.tsx`
- `apps/web-1/app/supporter/case/[id]/page.tsx`

## Implementation Steps
1. Chốt glossary demo: hồ sơ phản biện, nhu cầu hỗ trợ, tài liệu minh chứng, supporter, phản hồi.
2. Ghi narrative guardrails: không để nhiều product nouns cạnh tranh trong cùng path.
3. Audit label customer-facing trong intake, dashboard, case detail, sidebar, discussion, timeline.
4. Audit label admin/supporter để đơn giản hóa nhưng vẫn đúng nghiệp vụ.
5. Chốt bảng mapping trạng thái hiển thị mục tiêu ở frontend.
6. Ghi role-facing wording rules cho student/admin/supporter.
7. Chỉ mô tả intent và hierarchy; không khóa micro-copy/visual chi tiết quá mức.

## Todo list
- [ ] Chốt glossary ngắn cho demo
- [ ] Xác định label mâu thuẫn hiện tại
- [ ] Xác định status labels mục tiêu
- [ ] Ghi role-facing wording rules
- [ ] Ghi guardrails để không over-spec UI

## Success Criteria
- Không còn thuật ngữ mâu thuẫn trên demo path chính.
- Customer-facing surfaces dùng nhất quán `Hồ sơ phản biện`.
- Admin/supporter hiểu case intent nhanh hơn.
- Implementer vẫn còn tự do chọn visual treatment hợp lý.

## Risk Assessment
- Risk thấp nếu chỉ đổi copy và display mapping.
- Risk trung bình nếu string hiển thị đang bị phụ thuộc ở nhiều nơi.

## Security Considerations
- Không thay auth/session.
- Không lộ internal-only terms hoặc metadata không cần cho customer-facing story.

## Next steps
- Sang phase 02 để chỉnh intake flow theo narrative đã chốt.