# Nexus Platform Frontend Rebuild Plan

Kế hoạch tổng quan xây dựng lại giao diện (Frontend Rebuild) cho hệ thống Nexus - nền tảng phản biện ý tưởng khởi nghiệp dành cho sinh viên. Toàn bộ backend, database và API hiện tại được bảo toàn.

## Route-Based Scalable Folder Structure
Để đảm bảo cấu trúc dự án Next.js dễ bảo trì, mở rộng và các file không bị quá dài, dự án áp dụng mô hình cấu trúc phân rã theo route (Route-Based Decomposition) kết hợp với các thư mục ẩn bắt đầu bằng dấu gạch dưới (`_components`, `_hooks`, `_types`):

```
apps/web-1/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── page.tsx                      # Landing page (Public)
│   │   ├── _components/              # Components riêng cho Landing page
│   │   └── _hooks/                   # Hooks riêng cho Landing page
│   ├── auth/
│   │   ├── page.tsx                  # Auth page (Email/Password + Google)
│   │   └── _components/              # Form Đăng nhập / Đăng ký
│   ├── dashboard/
│   │   ├── page.tsx                  # Student Dashboard
│   │   ├── _components/              # CaseCard, EmptyState...
│   │   ├── _hooks/                   # useCasesList...
│   │   ├── intake/
│   │   │   ├── page.tsx              # Biểu mẫu đàm thoại (Conversational Intake)
│   │   │   ├── _components/          # IntakeChatFlow, ProgressIndicator...
│   │   │   ├── _hooks/               # useIntakeForm...
│   │   │   └── _types/
│   │   └── case/
│   │       └── [id]/
│   │           ├── page.tsx          # Case Workspace chính
│   │           ├── _components/      # CaseStatusHeader, UnpaidAlert, Tabs...
│   │           └── _hooks/           # useCaseDetails, useCaseChat...
│   ├── supporter/
│   │   └── case/
│   │       └── [id]/
│   │           └── review/
│   │               ├── page.tsx      # Supporter Report Review
│   │               └── _components/  # FindingCard, FindingEditor...
│   └── admin/
│       ├── page.tsx                  # Admin Console
│       └── _components/              # VerificationTable, AssignmentTable...
├── components/
│   ├── ui/                           # Các component UI dùng chung hệ thống
│   │   ├── ThemeToggler.tsx
│   │   └── LoadingSkeleton.tsx
│   └── layout/                       # Layout Shell dùng chung
│       ├── AppShell.tsx
│       ├── AuthShell.tsx
│       └── DashboardShell.tsx
├── lib/
│   ├── api-client.ts                 # Axios instance kết nối tới API port 8000
│   └── auth-client.ts                # Better Auth Web Client
└── types/
    └── index.ts                      # Kiểu dữ liệu dùng chung (Case, Report...)
```

## Tech Stack
1. **Framework**: Next.js 16 (App Router), React 19.
2. **UI Library**: Chỉ sử dụng duy nhất **HeroUI v3** làm nền tảng chính cho các component tương tác.
3. **Styling**: Tailwind CSS v4 (cấu hình `@theme` trực tiếp trong `globals.css`).
4. **State & Form**: 
   - **TanStack Query (React Query)** để quản lý state server-side, fetching/caching dữ liệu từ backend Hono.
   - **TanStack Form** để quản lý state và validation các form đăng nhập, biểu mẫu nộp ý tưởng (Intake) và phản hồi.
5. **Icons**: Lucide React.
6. **Authentication**: Better Auth Client.

---

## Phases

| # | Phase | Status | Detail Link |
|---|---|---|---|
| B | Database & Core API Setup (Backend) | Completed (Do Not Touch) | [Phase Backend](./phase-backend-database-api.md) |
| 0 | Frontend Foundation | Pending / Rebuild Required | [Phase 0](./phase-00-frontend-foundation.md) |
| 1 | Public Landing & Auth | Pending / Rebuild Required | [Phase 1](./phase-01-public-landing-auth.md) |
| 2 | Student Dashboard & Intake | Pending / Rebuild Required | [Phase 2](./phase-02-student-dashboard-intake.md) |
| 3 | Case Workspace | Pending / Rebuild Required | [Phase 3](./phase-03-case-workspace.md) |
| 4 | Report Review Experience | Pending / Rebuild Required | [Phase 4](./phase-04-report-review-experience.md) |
| 5 | Payment & Admin Operations | Pending / Rebuild Required | [Phase 5](./phase-05-payment-admin-operations.md) |
| 6 | Frontend QA & Polish | Pending / Rebuild Required | [Phase 6](./phase-06-frontend-qa-polish.md) |

---

## Global Frontend Design Direction (Calm UI - Rules Compliance)

Triết lý thiết kế Calm UI kế thừa nguyên tắc cốt lõi từ `.agents/rules/frontend-ui-rules.md`: rõ ràng trước, đẹp sau; quen thuộc trước, sáng tạo sau. Giao diện phẳng, sạch, chuyên nghiệp và có chiều sâu. Cảm xúc thiết kế: *"Calm mentor workspace"* — không phải government portal, không phải neon AI product.

### Color System (Source of Truth: `design-system/nexus-platform/color-template.md`)

Bảng màu Nexus được xây dựng theo chiến lược cảm xúc: **Teal là màu thương hiệu chính** (bình tĩnh, hướng dẫn, tin cậy), **Warm Orange là điểm nhấn ấm áp** (khích lệ, năng lượng, con người). Không dùng Orange làm màu thương hiệu chính. Không dùng Emerald làm màu CTA mặc định (tránh nhầm lẫn với trạng thái thành công).

| Vai trò | Light Mode | Dark Mode | Ghi chú |
|---------|-----------|-----------|---------|
| **Brand Primary** | `#0D9488` (Teal 600) | `#14B8A6` (Teal 500) | CTA chính, tab active, navigation, workflow |
| **Brand Hover** | `#0F766E` (Teal 700) | `#2DD4BF` (Teal 400) | Hover state |
| **Brand Soft** | `#CCFBF1` (Teal 100) | `rgba(45,212,191,0.16)` | Background nhẹ, badge brand |
| **Brand Subtle** | `#F0FDFA` (Teal 50) | `rgba(20,184,166,0.10)` | Vùng guidance nhẹ |
| **Warm Accent** | `#F97316` (Orange 500) | `#F97316` | Landing CTA, điểm nhấn marketing, onboarding |
| **Warm Accent Hover** | `#EA580C` (Orange 600) | `#EA580C` | Hover state |
| **Warm Accent Soft** | `#FFEDD5` (Orange 100) | — | Background ấm nhẹ |
| **Success** | `#10B981` (Emerald 500) | `#10B981` | Approved, paid, completed |
| **Warning** | `#F59E0B` (Amber 500) | `#F59E0B` | Pending, needs clarification |
| **Danger** | `#EF4444` (Red 500) | `#EF4444` | Rejected, error, destructive |
| **Info** | `#3B82F6` (Blue 500) | `#3B82F6` | Thông tin hệ thống |
| **Background** | `#FBFAF7` (Warm off-white) | `#0F172A` | Nền chính app |
| **Surface** | `#FFFFFF` | `#111827` | Card, panel |
| **Surface Soft** | `#F8FAFC` | `#1E293B` | Vùng phụ |
| **Border** | `#E2E8F0` | `#334155` | Viền mặc định |
| **Text** | `#1F2937` | `#F8FAFC` | Văn bản chính |
| **Text Muted** | `#64748B` | `#CBD5E1` | Văn bản phụ |

### Quy tắc sử dụng màu theo ngữ cảnh

- **Nút CTA mặc định trong app**: Teal (VD: "Tiếp tục", "Gửi thông tin", "Chạy phản biện")
- **Nút CTA marketing/landing**: Warm Orange khi cần điểm nhấn ấm; Teal khi trong ngữ cảnh app
- **Nút thứ cấp**: Outline / Neutral border
- **Nút Approve/Complete**: Emerald chỉ khi ngữ cảnh là xác nhận thành công
- **Nút Reject/Delete**: Red
- **Status badges**: Luôn có chữ mô tả kèm theo, không chỉ dựa vào màu
- **Trang sinh viên**: Ấm hơn, hỗ trợ hơn (dùng warm off-white background)
- **Trang supporter/admin**: Trung tính hơn, nhanh hơn (dùng neutral surfaces)

### Design Principles

1. **Một màn hình, một nhiệm vụ chính**: Mỗi màn hình hoặc phân khu tập trung vào một công việc cụ thể.
2. **Một hành động chính (One Primary Action)**: Chỉ có duy nhất một nút bấm Primary nổi bật (**Teal**) trên một màn hình tại một thời điểm. Nút phụ dùng outline hoặc secondary style.
3. **Trạng thái minh bạch (Status Transparency)**: Người dùng luôn biết mình ở đâu (Breadcrumbs), trạng thái dự án là gì (Status chip rõ ràng kèm chữ mô tả), và cần làm gì tiếp theo.
4. **Phân lớp dữ liệu rõ rệt**: Tách biệt rõ 3 lớp thông tin: Ý tưởng của sinh viên (Input), Phản biện của AI (AI Output), và Đánh giá/Phê duyệt của Supporter (Decision).
5. **Tiết lộ lũy tiến (Progressive Disclosure)**: Hiển thị kết luận ngắn gọn/summary trước, chi tiết mở rộng xem sau qua accordion/tab/drawer để giảm tải lượng thông tin hiển thị cùng lúc.
6. **Thiết kế cho sự chỉnh sửa nhiều vòng**: Hỗ trợ chuyển đổi mượt mà giữa các phiên bản tài liệu (`v00`, `v01`...) nhưng giữ nguyên lịch sử trao đổi và timeline sự kiện.
7. **AI Finding có cấu trúc rõ ràng**: Điểm phản biện từ AI bắt buộc có đủ căn cứ: Phần bị lỗi (Field), Trạng thái (Status), Bằng chứng (Evidence), Lý do (Reason), Câu hỏi (Question), Hành động tiếp theo (Next Action).
8. **Microcopy thực dụng**: Sử dụng tiếng Việt phổ thông, trực tiếp, ngắn gọn. Tuyệt đối loại bỏ từ ngữ marketing sáo rỗng (như "optimize", "unlock", "AI-powered").
9. **Empty State & Error State thân thiện**: Luôn giải thích rõ: Có chuyện gì xảy ra, tại sao, và người dùng cần bấm vào đâu để xử lý.
10. **Tham khảo skill ui-ux-pro-max**: Tận dụng skill `ui-ux-pro-max` để tham khảo visual direction, layout và typography, nhưng bắt buộc lọc toàn bộ gợi ý qua `.agents/rules/frontend-ui-rules.md` (không để skill ghi đè các yêu cầu cốt lõi của Nexus như tính rõ ràng của AI output, tách biệt 3 lớp thông tin, thiết kế mượt mà nhiều vòng).

---

## Backend Assumptions / Do Not Touch

1. **Database Schema**: Prisma schema đã hoàn thiện với cấu trúc bảng số nhiều, cột snake_case (`cases`, `reports`, `payments`, `users`...). Không thay đổi hoặc migrate lại DB.
2. **Better Auth Server**: Module xác thực Better Auth nằm ở server API backend (`apps/api`), Frontend chỉ giao tiếp qua Better Auth Web Client để đồng bộ cookie session.
3. **AI Report Pipeline**: AI Draft được sinh tự động trên server qua Vercel AI SDK. AI Draft này tuyệt đối không gửi thẳng cho học viên mà bắt buộc qua hàng chờ Supporter duyệt trên dashboard.
4. **Payment Proof Storage**: Minh chứng thanh toán được lưu trữ cục bộ dưới dạng file tĩnh trên server Hono, frontend gọi API upload và truyền link ảnh.
