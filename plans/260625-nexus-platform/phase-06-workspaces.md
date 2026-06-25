# Phase 6: Workspaces

## Context Links
- [Overview Plan](./plan.md)
- [Workspace Spec Web](../../docs/web-spec/web-spec-ai-human-ops.md)

## Overview
- **Priority**: P1
- **Status**: Pending
- **Description**: Phát triển giao diện Dashboard cho người dùng, workspace cho Supporter và trang điều phối của Admin.
- **Estimated Effort**: 5h

## Key Insights
- Không chỉ check Role của user. Phải kiểm tra quyền sở hữu hoặc được assign đối với từng Case cụ thể (Object Permission).
- Màn hình Case Workspace chia 3 vùng (left: timeline, middle: documents, right: messages/actions) để tối ưu trải nghiệm sử dụng.

## Requirements
- **User Dashboard**: List cases của user, nút tạo case mới, lịch sử case, xem report approved.
- **Supporter Queue**: Danh sách case được assign, ghi chú nội bộ (internal note), xem AI draft.
- **Admin Console**: Quản lý all cases, assign supporter, kiểm tra chất lượng dữ liệu.
- **Timeline/Log**: Log hoạt động dạng timeline (HeroUI chip/events).
- <!-- Updated: Validation Session 1 - Hiển thị bộ đếm ngược SLA 24h - 48h trên dashboard supporter -->
- **SLA Countdown Timer**: Hiển thị thời gian còn lại cho supporter phản hồi (24h-48h kể từ lúc submit).
- **Phân lớp dữ liệu rõ ràng (Rule 15)**: Tách biệt rõ rệt 3 lớp: Dữ liệu nhập của sinh viên (Input), Nhận xét của AI (AI Output), và Đánh giá/Quyết định của Supporter (Decision).
- **Lịch sử sửa đổi (Rule 14)**: Selector dropdown cho phép xem lại các bản tài liệu cũ và lịch sử các vòng audit (`v01`, `v02`).
- **Hiển thị cuốn chiếu (Rule 6)**: Sử dụng HeroUI Accordion hoặc Drawer cho chi tiết các lỗi ý tưởng để giảm tải lượng thông tin hiển thị cùng lúc.

## Architecture
- **State Management**: TanStack Query (React Query) v5.
- **UI Components**: HeroUI Table, Tabs, Badge, Avatar, Modal, Accordion, Drawer, và Custom Countdown component.

## Related Code Files
- [NEW] [apps/web/app/dashboard/page.tsx](../../apps/web/app/dashboard/page.tsx) - Dashboard của sinh viên.
- [NEW] [apps/web/app/dashboard/case/[id]/page.tsx](../../apps/web/app/dashboard/case/%5Bid%5D/page.tsx) - Chi tiết case 3 vùng.
- [NEW] [apps/web/app/supporter/page.tsx](../../apps/web/app/supporter/page.tsx) - Hàng chờ và edit draft của Supporter.
- [NEW] [apps/web/app/admin/page.tsx](../../apps/web/app/admin/page.tsx) - Dashboard điều phối của Admin.
- [NEW] [apps/web/components/shared/sla-timer.tsx](../../apps/web/components/shared/sla-timer.tsx) - Component hiển thị đếm ngược SLA.
- [NEW] [apps/web/components/case/version-selector.tsx](../../apps/web/components/case/version-selector.tsx) - Component chuyển đổi các bản tài liệu/report cũ.

## Implementation Steps
1. Dựng trang danh sách Case cho sinh viên sử dụng `<Table>` của HeroUI.
2. Thiết lập trang chi tiết Case:
   - Cột trái: Activity timeline từ table `case_events`.
   - Cột giữa: Đọc file/link đính kèm, selector version tài liệu và xem Report vNN tương ứng hiển thị bằng Accordion.
   - Cột phải: Khung chat/comment và Note nội bộ (chỉ supporter/admin xem được note).
3. Thiết lập hàng chờ cho Supporter có bộ lọc trạng thái case và hiển thị đếm ngược SLA 24h-48h bằng component `sla-timer.tsx`.
4. Thiết lập Admin Console để gán supporter cho các case mới.

## Todo List
- [ ] Xây dựng trang danh sách Case cho User.
- [ ] Dựng giao diện 3 vùng chi tiết Case.
- [ ] Dựng component `version-selector.tsx` đổi bản tài liệu/report.
- [ ] Xây dựng màn hình hàng chờ của Supporter kèm bộ đếm ngược SLA.
- [ ] Xây dựng màn hình điều phối supporter của Admin.

## Success Criteria
- Sinh viên chỉ xem được case của nhóm mình.
- Supporter xem và ghi chú nội bộ được cho case được gán.
- Giao diện 3 vùng hiển thị thông tin rõ ràng, không bị chồng chéo.

## Risk Assessment
- *Rủi ro*: Rò rỉ thông tin note nội bộ hoặc AI draft sang giao diện sinh viên.
- *Khắc phục*: Tách biệt logic API endpoint và check quyền chặt chẽ trên backend.

## Security Considerations
- Đảm bảo endpoint API message, note, document check kĩ token của user có khớp với case member hay assigned supporter.

## Next Steps
- Triển khai luồng Thanh toán thủ công ở [Phase 7](./phase-07-manual-payments.md).
