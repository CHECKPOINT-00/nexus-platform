# Code standards

## Repo structure

- `apps/api`: Hono backend, Better Auth, Prisma, document/report/payment workflows.
- `apps/web-1`: Next.js 16 product app.
- `packages/ui`: shared React primitives.
- `prisma/schema.prisma`: single source of truth cho data model.

## Conventions

- TypeScript ESM.
- Relative import trong TS dùng `.js` suffix.
- Một root `.env`, không tách env per app.
- Prisma dùng plural table names và snake_case field names.
- Auth/session logic chỉ sống trong `apps/api`.

## API standards

- Mount auth qua `/api/auth/*`.
- Keep CORS narrow, chủ yếu cho localhost dev origin cần thiết.
- Stream/health/session là runtime endpoint nền tảng.
- Authorization phải bám role + case membership từ `apps/api`, không duplicate policy ở frontend.
- Contract mới cho document workspace nên additive và backward-compatible với payload case detail hiện có.

## Web standards

- Next.js app tách theo route group rõ ràng: public, auth, dashboard, supporter, admin.
- Giữ UI consistent với Mantine UI v9 và shared primitives.
- **Anti-pattern định vị Mantine UI**: Không tự cấu hình định vị hoặc căn giữa các Modals, Drawers bằng các class của Tailwind (ví dụ `fixed`, `flex`, `items-center`, `justify-center`, `z-[9999]`). Luôn sử dụng các props dựng sẵn của Mantine (như `centered`, `size`, `position`, `xOffset`, `yOffset`) để tránh xung đột layout và lỗi scrollbar.
- Tránh đưa business logic nặng vào component page nếu có thể tách hook/module.
- Với Nexus MVP hiện tại, ưu tiên giữ shared workspace shell thay vì mở thêm nhiều page flow rời rạc.
- Phân biệt rõ 2 lớp document flow:
  - intake đã hỗ trợ định hướng minh chứng/tài liệu trước (profile/evidence-first), lưu bản ghi trực tiếp thông qua `document_records`;
  - downstream case workspace có `DocumentWorkspace` hiển thị chi tiết theo tab và checkpoint.
- Discussion/chat hiện là REST + polling (5s chat, 10s case details); không viết tài liệu hoặc UI như thể đã có realtime socket nếu chưa implement.
- Student workspace hiện ưu tiên `documents`, `discussion`, `timeline`, `settings`; supporter workspace tái dùng shell và có review page riêng.
- Payment & Refund:
  - Luôn sử dụng các hàm helper trong `@/lib/pricing.ts` (`getCaseEffectivePrice`, `validatePaymentProof`, `caseRequiresPayment`) khi cần hiển thị, tính toán giá trị hoặc kiểm tra file minh chứng.
  - Đảm bảo cơ chế **Price Locking** được áp dụng triệt để: lấy giá từ `Case.locked_price` thay vì từ bảng `ServicePackage` khi thực hiện các giao dịch thanh toán hoặc yêu cầu hoàn tiền.
  - Khi xử lý hoàn tiền, bắt buộc kiểm tra điều kiện phân công supporter (`assigned_supporter_auth_user_id === null`) để phân chia Tier 1/Tier 2 và chạy transaction an toàn ngăn chặn race condition.
- Payment là surface phụ; không để nó lấn narrative chính của audit/review flow.

## API module organization

- Bounded context theo domain: cases, reports, payments, packages, documents, admin, supporter, ai-engine.
- Layering theo clean architecture: domain, application, infrastructure, presentation.
- Modules giao tiếp trực tiếp qua use-case/service, không cần bus cho MVP.

## Documentation standards

- Doc nói đúng hiện trạng, không invent API hay env key.
- File mới nên đặt theo topic rõ ràng, không tạo folder rỗng lạm dụng.
- Giữ nội dung ngắn, có thể scan nhanh.
- Khi mô tả MVP demo flow, ghi rõ cái gì đã được code xác nhận và cái gì là deferred decision.
- Nếu một bề mặt đã tồn tại trong codebase như document workspace, chat, timeline, supporter review, sidebar workspace, hoặc payment page, phải mô tả đúng vai trò hiện tại của nó trước khi đề xuất thay đổi.
- Với DB docs, phân biệt rõ runtime config (`DATABASE_URL`/`DIRECT_URL`) với read-only query workflow (`READONLY_DATABASE_URL`).
