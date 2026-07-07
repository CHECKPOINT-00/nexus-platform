# Production Database Script Query Guide (Read-Only)

Tài liệu này hướng dẫn cách viết file script tạm thời để truy vấn dữ liệu từ Production Database của Supabase một cách nhanh chóng, an toàn bằng Node.js/TypeScript, sử dụng tài khoản Read-Only `guest` đã được cấu hình trong file `.env`.

> [!NOTE]
> Tài khoản **`guest`** đã được cấu hình toàn bộ quyền đọc (`SELECT`) trên toàn bộ bảng hiện tại và tương lai của schema `public`, đảm bảo an toàn tối đa cho DB Production. Mọi câu lệnh thay đổi dữ liệu (`INSERT`, `UPDATE`, `DELETE`) đều sẽ bị từ chối truy cập.

---

## 1. Thông tin kết nối (Connection Details)

Để đảm bảo an toàn tối đa cho dữ liệu Production, mọi hoạt động truy vấn tự do hoặc viết script tra cứu **chỉ được phép sử dụng duy nhất biến môi trường `READONLY_DATABASE_URL`**. Tuyệt đối không sử dụng `DATABASE_URL` hoặc `DIRECT_URL` để tránh rủi ro thay đổi dữ liệu ngoài ý muốn.

* **Biến môi trường duy nhất được dùng:** `READONLY_DATABASE_URL`
* **Quyền hạn:** Chỉ đọc (`SELECT`) trên schema `public`.

---

## 2. Cách viết và chạy script truy vấn trực tiếp

Do môi trường chạy lệnh hoặc một số hệ điều hành không cài đặt sẵn `psql` hoặc các công cụ dòng lệnh PostgreSQL, phương pháp viết script TypeScript/JavaScript chạy qua Node/tsx là tối ưu nhất.

### Bước 1: Tạo file script tạm thời
Tạo một file script tạm (ví dụ: `scripts/temp-query.ts` hoặc `temp/query-db.ts`) với nội dung sử dụng thư viện `pg` (được cài đặt sẵn trong dự án):

```typescript
import 'dotenv/config'
import pg from 'pg'

const connectionString = process.env.READONLY_DATABASE_URL

if (!connectionString) {
  console.error('Lỗi: Chưa định nghĩa READONLY_DATABASE_URL trong file .env')
  process.exit(1)
}

async function main() {
  console.log('Đang kết nối tới Production Database (Read-Only)...')
  const client = new pg.Client({ connectionString })

  try {
    await client.connect()
    
    // Viết câu lệnh SQL truy vấn của bạn ở đây
    const query = `
      SELECT id, name, email, role 
      FROM users 
      LIMIT 5;
    `
    const res = await client.query(query)
    
    console.log('\n--- Kết quả truy vấn ---')
    console.table(res.rows)

  } catch (error) {
    console.error('Lỗi thực thi truy vấn:', error)
  } finally {
    await client.end()
  }
}

main()
```

### Bước 2: Chạy script bằng tsx
Để chạy file script TypeScript mà không cần compile thủ công, sử dụng công cụ `tsx` được tích hợp sẵn trong devDependencies của dự án:

```bash
# Chạy script từ thư mục gốc
npx tsx <đường-dẫn-file-script>

# Ví dụ:
npx tsx scripts/temp-query.ts
```

---

## 3. Các bảng dữ liệu chính trong Schema `public`

Bạn có thể query 18 bảng chính được cấu hình trong [schema.prisma](../prisma/schema.prisma):
* `users` - Người dùng hệ thống (student, admin, supporter).
* `sessions` - Quản lý phiên đăng nhập của người dùng.
* `accounts` - Thông tin tài khoản liên kết đăng nhập OAuth (Google).
* `verifications` - Lưu trữ token xác thực email/otp.
* `two_factors` - Cấu hình bảo mật 2 lớp (2FA/MFA) của người dùng.
* `service_packages` - Các gói dịch vụ (price, is_active, features) và audit trail đổi giá.
* `cases` - Hồ sơ phản biện (Evaluation Profile) của nhóm sinh viên.
* `case_members` - Thành viên nhóm sinh viên tham gia trong một Hồ sơ phản biện.
* `checkpoints` - Các mốc đánh giá của case (ví dụ Checkpoint 1, Checkpoint 2).
* `lifecycle_units` - Các phiên bản nộp/sửa tài liệu liên kết trong checkpoint.
* `document_records` - Bản ghi lưu trữ file tài liệu tải lên trực tiếp hoặc qua link Drive.
* `document_types` - Danh mục các loại tài liệu hỗ trợ.
* `reports` - Báo cáo phản biện (Evaluation Report) của chuyên gia phản biện.
* `payments` - Minh chứng và thông tin thanh toán của Hồ sơ phản biện.
* `case_messages` - Tin nhắn thảo luận và trao đổi (`Trao đổi & phản hồi`).
* `case_events` - Nhật ký lịch sử hành động trên case (`timeline/event log`).
* `ai_jobs` - Hàng đợi các tiến trình xử lý AI không đồng bộ.
* `refunds` - Yêu cầu và thông tin hoàn tiền dịch vụ (`Refund Module`).

Ví dụ câu lệnh kiểm tra số lượng bản ghi của tất cả các bảng:
```sql
SELECT 
    table_name, 
    (xpath('/row/cnt/text()', xmlparse(document query_to_xml(format('select count(*) as cnt from %I.%I', table_schema, table_name), false, true, ''))))[1]::text::int AS row_count
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    row_count DESC;
```

---

## 4. Chính sách bảo mật (Security & Safety)
Tài khoản `guest` chỉ được cấp quyền `SELECT`. Mọi lệnh can thiệp ghi dữ liệu đều bị chặn:

```sql
UPDATE users SET name = 'Test' WHERE id = '1';
-- ERROR: permission denied for table users
```
