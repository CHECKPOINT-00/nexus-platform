# Bộ spec web Nexus

Tài liệu này gom các quyết định web từ transcript raw thành bộ spec dễ review. Mỗi file bên dưới giữ một lát cắt riêng để tránh một file quá dài và để team dễ khóa từng phần.

## Trạng thái chung

Spec hiện đã chốt khá nhiều phần lõi. Những mục còn mở chủ yếu là chi tiết vận hành, mức giá cuối, và vài ranh giới MVP cần xác nhận thêm.

## Các tài liệu trong bộ spec

1. [`web-spec-product-overview.md`](./web-spec-product-overview.md), phạm vi sản phẩm, định vị public/private, ranh giới messaging công khai.
2. [`web-spec-user-roles-auth.md`](./web-spec-user-roles-auth.md), auth, role, quyền truy cập, phân lớp dữ liệu.
3. [`web-spec-intake-workflow.md`](./web-spec-intake-workflow.md), UX intake dạng hội thoại có cấu trúc và action form.
4. [`web-spec-ai-human-ops.md`](./web-spec-ai-human-ops.md), AI vs supporter, dashboard, workspace, giao tiếp case, report lifecycle.
5. [`web-spec-pricing-packages.md`](./web-spec-pricing-packages.md), gói dịch vụ, cách tính phí, thanh toán, minh chứng.
6. [`web-spec-case-lifecycle.md`](./web-spec-case-lifecycle.md), stage/status/flags, document lifecycle, Drive, version, workflow.
7. [`web-spec-data-model-notes.md`](./web-spec-data-model-notes.md), dữ liệu và artifact cần lưu trong Postgres và cách mirror Drive.
8. [`web-spec-open-questions.md`](./web-spec-open-questions.md), mâu thuẫn đã giải quyết, giả định, câu hỏi còn mở, ý tưởng để phase sau.

## Snapshot quyết định cuối

- Web dùng mô hình hybrid, public landing page + private workspace.
- Auth dùng Better Auth, không dùng email FPT bắt buộc.
- Role chốt: `guest`, `user`, `supporter`, `admin`.
- Intake là conversational structured intake, không phải Google Form thuần, cũng không phải chat tự do.
- AI core chạy trong Hono backend, dùng Vercel AI SDK; n8n chỉ là automation phụ.
- Workflow là AI-assisted + supporter-controlled, không AI-only.
- Pricing tính theo team, case, package.
- Drive là source of truth cho file lifecycle, Postgres mirror metadata và workflow.
- Report có lifecycle riêng, không trả thẳng text AI cho user.
- MVP ưu tiên thay được Google Form, Google Sheet, Drive manual, và Zalo/Telegram ở mức tối thiểu.
- Kim chỉ nam suy luận spec dùng Triad Lens (NMF–IPOD–CV): NMF để làm rõ ngữ nghĩa và framing, IPOD để tách input/process/output/data, CV để phân biệt constant với variable.

## Cách đọc nhanh

- Muốn hiểu sản phẩm trước, đọc file overview.
- Muốn khóa quyền và auth, đọc file roles/auth.
- Muốn review intake UX, đọc file intake.
- Muốn review vận hành case, đọc file AI/human ops và case lifecycle.
- Muốn review giá và thanh toán, đọc file pricing.
- Muốn xem phần chưa chốt, đọc file open questions.
