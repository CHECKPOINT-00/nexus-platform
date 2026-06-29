# Phase 02 — Realign intake and submit flow

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-01-lock-demo-narrative-and-terminology.md`
- Source parent package: `../260629-1722-mvp-demo-realignment/phase-02-realign-intake-and-submit-flow.md`

## Overview
- Date: 2026-06-29
- Description: Làm intake và review/submit kể đúng câu chuyện giá trị của Nexus cho customer demo.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Intake hiện hợp lệ về data nhưng chưa đủ rõ về context, need, evidence, expected outcome.
- Documents đã mạnh về validation nhưng chưa được framing như bằng chứng chính.
- Review screen cần đọc như service promise hơn là raw summary dump.

## Requirements
- Giữ intake architecture hiện tại.
- Không đổi `IntakeData` shape nếu không thật cần.
- Tăng clarity cho 4 điểm: bối cảnh, nhu cầu hỗ trợ, tài liệu minh chứng, đầu ra mong muốn.
- Giữ current Drive/Docs URL + checklist semantics; không phát minh document manager mới.

## Architecture
- Presentation-first refinement tại intake steps và review summary.
- Không refactor backend contracts.
- Xem `documents[0]` là bundle hồ sơ minh chứng hiện có; chỉ đổi framing và emphasis.
- Chỉ chốt information order và semantic intent, không chốt visual chi tiết.

## Related code files
- `apps/web-1/app/dashboard/intake/_components/IntakeChatFlow.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/SituationStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/SupportNeedsStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/DocumentInputStep.tsx`
- `apps/web-1/app/dashboard/intake/_components/Steps/ReviewSubmitStep.tsx`
- `apps/web-1/app/dashboard/intake/hooks/useIntakeForm.ts`

## Implementation Steps
1. Điều chỉnh framing từng step để flow đọc như quá trình tạo hồ sơ phản biện.
2. Tối ưu placeholder/help text ở SituationStep để user mô tả pain thật và bối cảnh rõ hơn.
3. Tối ưu SupportNeedsStep để expected output cụ thể, action-oriented.
4. Nhấn mạnh DocumentInputStep là tài liệu giúp supporter phản biện chính xác.
5. Giữ logic Drive/Docs URL chính + checklist loại tài liệu đang có.
6. Sắp ReviewSubmitStep theo thứ tự: vấn đề -> hỗ trợ cần -> bằng chứng -> kết quả mong muốn.
7. Kiểm tra draft/default values không lệch wording mới.
8. Tránh mô tả exact UI composition quá mức; chỉ chốt đọc như thế nào.

## Todo list
- [ ] Chỉnh framing flow intake
- [ ] Chỉnh copy SituationStep
- [ ] Chỉnh copy SupportNeedsStep
- [ ] Chỉnh copy DocumentInputStep
- [ ] Chỉnh cấu trúc summary ở ReviewSubmitStep
- [ ] Kiểm tra draft/default values liên quan

## Success Criteria
- Student hiểu phải nộp gì và vì sao trong từng bước.
- Review screen đủ rõ để presenter demo mà không cần giải thích nhiều.
- Intake tạo cảm giác Nexus đang chuẩn bị phản biện thật, không chỉ thu form.

## Risk Assessment
- Risk thấp đến trung bình.
- Dễ phát sinh mismatch text/validation nếu sửa wording không cẩn thận.

## Security Considerations
- Không thay upload/auth/session.
- Không làm nới validation tài liệu theo cách gây nhận input sai.

## Next steps
- Sang phase 03 để đồng bộ các bề mặt case/admin/supporter.