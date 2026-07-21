# Phase 02 — Realign intake and submit flow

## Context links
- Parent plan: `./plan.md`
- Depends on: `./phase-01-lock-demo-narrative-and-terminology.md`
- Research: `./research/researcher-01-demo-path-report.md`
- Synthesis: `./reports/planner-synthesis-report.md`

## Overview
- Date: 2026-06-29
- Description: Làm intake và review/submit kể đúng câu chuyện giá trị của Nexus cho khách hàng demo.
- Priority: High
- Implementation status: Pending
- Review status: Pending

## Key Insights
- Intake hiện hợp lệ về mặt dữ liệu, nhưng chưa đủ rõ về vấn đề khách hàng và kết quả mong muốn.
- Documents đã mạnh về validation nhưng chưa được nhấn như evidence chính.
- Review screen đang là summary data hơn là service promise.

## Requirements
- Giữ kiến trúc intake hiện tại.
- Không đổi `IntakeData` shape nếu không thật cần.
- Tăng clarity cho 4 điểm: bối cảnh, nhu cầu hỗ trợ, tài liệu minh chứng, đầu ra mong muốn.

## Architecture
- Presentation-first refinement tại intake steps và review summary.
- Không refactor backend contracts.
- Xem intake document model hiện tại là nền đã có; chỉ đổi framing và emphasis, không phát minh upload subsystem mới.

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
4. Nhấn mạnh DocumentInputStep là tài liệu giúp supporter phản biện chính xác; giữ logic Drive/Docs URL chính + checklist loại tài liệu đang có.
5. Sắp lại ReviewSubmitStep theo thứ tự kể chuyện: vấn đề -> hỗ trợ cần -> bằng chứng -> kết quả mong muốn.
6. Kiểm tra summary wording để `documents[0]` bundle hiện tại đọc như hồ sơ minh chứng, không như field kỹ thuật.
7. Kiểm tra default values/draft flow có bị lệch wording mới không.

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
- Sang phase 03 để đồng bộ bề mặt case/admin/supporter.
