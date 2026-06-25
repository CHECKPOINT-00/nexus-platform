# Plan Audit Report: Ambiguity & Edge Case Review

Date: 2026-06-25
Author: Antigravity Code Reviewer
Reference: `/code-review` Skill Protocol

---

## 1. Mơ hồ & Lỗ hổng logic (Ambiguities & Gaps)

### Lỗ hổng 1: Quan hệ Database và Prisma Types (Phase 1)
- **Mơ hồ**: Chưa định nghĩa kiểu dữ liệu cụ thể cho các khoá ngoại (foreign keys) và quan hệ giữa các bảng.
- **Giải quyết**: 
  - Better Auth sử dụng `id: String` cho model `User` (`users`). Vì vậy, `owner_auth_user_id`, `assigned_supporter_auth_user_id` và các trường `auth_user_id` liên quan đều phải mang kiểu `String`.
  - Phải cấu hình các chỉ mục `@index` trên khoá ngoại để tối ưu hoá tốc độ truy vấn Table cases.
  - Định nghĩa rõ quan hệ 1-N giữa `Case` và `Checkpoint`, `Checkpoint` và `LifecycleUnit`.

### Lỗ hổng 2: Bảng chứa dữ liệu Gói cước - `ServicePackage` (Phase 3)
- **Mơ hồ**: Phase 3 chốt cấu hình động trong database, nhưng schema.prisma ban đầu chưa khai báo bảng `packages`.
- **Giải quyết**: Thêm model `ServicePackage` vào `schema.prisma` gồm các trường:
  ```prisma
  model ServicePackage {
    id          String   @id @default(uuid())
    name        String
    price       Int
    description String
    features    String[]
    created_at  DateTime @default(now())
    updated_at  DateTime @updatedAt

    cases       Case[]
    payments    Payment[]

    @@map("service_packages")
  }
  ```

### Lỗ hổng 3: Lưu trữ ảnh minh chứng thanh toán - Proof File (Phase 7)
- **Mơ hồ**: Giao dịch chuyển khoản thủ công cần upload ảnh bằng chứng. Chúng ta sẽ lưu trữ file ảnh này ở đâu nếu chưa kết nối Drive API?
- **Giải quyết**: Lưu trữ file ảnh trực tiếp tại thư mục upload cục bộ của Hono backend (`apps/api/uploads/`) thông qua middleware static file phục vụ link ảnh. Link ảnh cục bộ (e.g. `/uploads/payment-proof-xxxx.png`) sẽ được ghi nhận vào cột `proof_file_url` trong database.

### Lỗ hổng 4: Cơ chế Fallback AI Provider (Phase 5)
- **Mơ hồ**: Chưa đặc tả cách thức chuyển đổi khi OpenAI lỗi.
- **Giải quyết**: Thiết lập một hàm wrapper `generateTextWithFallback` trong `ai.ts` thực hiện:
  - Gọi OpenAI API trước.
  - Nếu gặp lỗi giới hạn lượt gọi (rate limit) hoặc lỗi server (5xx), tự động bắt lỗi (catch) và chuyển hướng gọi Gemini API qua `@ai-sdk/google`.
  - Ghi nhận trạng thái provider thực tế vào bảng `ai_jobs` để phân tích độ tin cậy.

### Lỗ hổng 5: Khởi tạo quyền Supporter/Admin ban đầu (Phase 2)
- **Mơ hồ**: Không có cơ chế đăng ký cho supporter/admin.
- **Giải quyết**: Sử dụng tài khoản đăng ký Email/Password đầu tiên. Admin đầu tiên sẽ được chỉ định bằng cách cập nhật trực tiếp cột `role` thành `'admin'` trong bảng `users` qua Prisma Studio (`npm run prisma:studio`). Các supporter sau đó sẽ được tạo hoặc gán quyền bởi Admin thông qua Admin Console.

---

## 2. Đề xuất cập nhật Phase Files
Các thay đổi logic trên đã được đồng bộ trực tiếp vào các file tương ứng nhằm loại bỏ hoàn toàn sự mơ hồ khi bước vào phase code.
