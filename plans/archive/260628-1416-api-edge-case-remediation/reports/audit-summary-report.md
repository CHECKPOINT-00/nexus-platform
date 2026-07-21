# Audit summary report

## Scope
Lập plan implement các vấn đề edge case đã audit trong `apps/api`.

## Main findings
- **10 lỗi chưa xử lý**: uncaught auth failure, sai 401/403, thiếu state guard, thiếu supporter validation, payment amount/status risk.
- **12 lỗi xử lý một phần**: malformed JSON, weak field validation, race condition, weak status validation, oversize message, raw error leakage.
- **Blast radius lớn nhất** nằm ở:
  - `shared/infrastructure/authorization.ts`
  - `modules/cases/presentation/http/cases.routes.ts`
  - `modules/supporter/presentation/http/supporter.routes.ts`
  - `modules/payments/presentation/http/payments.routes.ts`
  - `modules/admin/presentation/http/admin.routes.ts`

## Plan direction
1. Ổn định auth/error semantics trước.
2. Tách validation/guard dùng chung.
3. Sửa workflow cases.
4. Sửa workflow supporter/reports.
5. Sửa admin/payment/package/ai-engine.
6. Bổ sung test + compile validation.

## Constraints
- Không tạo API giả.
- Giữ CORS hẹp.
- Auth/session chỉ sống trong `apps/api`.
- Ưu tiên code nhỏ, ít lặp, dễ review.

## Unresolved Questions
- Chuẩn payment status cuối cùng là gì?
- Unauthorized resource nên trả 403 hay 404?
- Có muốn gom state transition thành helper chung trong lần này không?
