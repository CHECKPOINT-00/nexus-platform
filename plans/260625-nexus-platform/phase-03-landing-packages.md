# Phase 3: Landing & Pricing Packages

## Context Links
- [Overview Plan](./plan.md)
- [Main Landing Page](../../apps/web/app/page.tsx)
- **Tài liệu tham khảo (References)**:
  - [Web Spec - Pricing & Packages](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/docs/web-spec/web-spec-pricing-packages.md)
  - [Web Spec - Product Overview](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/docs/web-spec/web-spec-product-overview.md)
  - [Design System Master Rules](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/design-system/nexus-platform/MASTER.md)

## Overview
- **Priority**: P2
- **Status**: Pending
- **Description**: Dựng trang landing page công khai, giới thiệu các gói dịch vụ (Mini-audit, Audit một lần, Audit & Review, Hỗ trợ nhiều vòng) và FAQ.
- **Estimated Effort**: 2h

## Key Insights
- Không được đưa thông tin chi tiết về syllabus FPT hay checkpoint giảng viên lên trang công khai.
- Sử dụng bảng màu cao cấp (HSL gradients, dark mode default) để gây ấn tượng mạnh.
- <!-- Updated: Validation Session 1 - Ngôn ngữ thuần Việt bình dị, tránh sáo rỗng marketing -->
- Sử dụng tiếng Việt rõ ràng, thay thế toàn bộ từ tiếng Anh marketing (như "optimize", "unlock", "enhance") thành "phản biện", "tìm lỗi ý tưởng", "giải thích chi tiết".

## Requirements
- Banner giới thiệu phản biện và phát triển ý tưởng.
- **Quy tắc nút bấm (Rule 5)**: Chỉ có 1 nút primary duy nhất trên trang (nút "Bắt đầu ngay" dẫn tới Intake). Tất cả các nút bấm khác (ví dụ "Xem chi tiết gói", "Đọc FAQ") đều dùng dạng outline / secondary.
- **Pricing Packages thuần Việt**:
  - Gói 0: Sàng lọc ý tưởng (Miễn phí)
  - Gói 1: Nhận xét 1 vòng
  - Gói 2: Nhận xét + Sửa đổi (2 vòng)
  - Gói 3: Đồng hành nhiều vòng
- Accordion danh sách câu hỏi FAQ.
- **UI/UX Specifications (Compliance)**:
  - **Clarity over Decoration & Plain Language (Rules 3 & 13)**: Loại bỏ hoàn toàn các slogan tiếp thị mơ hồ. Slogan chính: *"Phản biện và tìm lỗi ý tưởng khởi nghiệp theo checkpoint môn học"*.
  - **Button Variants**: Nút bấm "Bắt đầu ngay" sử dụng `color="primary" variant="solid"`. Nút bấm FAQ và thông tin các gói sử dụng `color="default" variant="bordered"` để đảm bảo quy tắc "Một màn hình, một hành động chính".


## Architecture
- **CSS System**: Tailwind CSS & Vanilla CSS modules.
- **UI Kit**: HeroUI Accordion, Card, Button.

## Related Code Files
- [MODIFY] [apps/web/app/page.tsx](../../apps/web/app/page.tsx) - Thay thế giao diện welcome mặc định.
- [NEW] [apps/web/components/landing/pricing-cards.tsx](../../apps/web/components/landing/pricing-cards.tsx) - Component hiển thị gói dịch vụ.

## Implementation Steps
1. Thiết kế Hero section với slogan phản biện thông minh (tránh slogan sáo rỗng, tập trung vào 4 câu hỏi UX core).
2. Viết dữ liệu tĩnh của các packages bằng tiếng Việt thuần.
3. Xây dựng Accordion FAQ bằng component `<Accordion>` của HeroUI.
4. Tối ưu responsive trên màn hình mobile.

## Todo List
- [ ] Thiết kế Banner / Hero với 1 nút Primary.
- [ ] Dựng Card các gói dịch vụ (Gói 0 đến Gói 3).
- [ ] Dựng FAQ Accordion.
- [ ] Kiểm tra responsive trên các thiết bị.

## Success Criteria
- Landing page tải nhanh, Responsive mượt mà.
- Hiển thị đúng thông tin các gói Mini-audit (0đ), Gói 1 lần, Gói nhiều lần.

## Risk Assessment
- *Rủi ro*: Mô tả dịch vụ làm người dùng nhầm lẫn là "học hộ" hoặc can thiệp điểm.
- *Khắc phục*: Dùng framing "phản biện và gợi ý cải thiện ý tưởng" (NMF).

## Security Considerations
- Đây hoàn toàn là public content, không cần check authentication.

## Next Steps
- Xây dựng luồng Structured Conversational Intake ở [Phase 4](./phase-04-conversational-intake.md).
