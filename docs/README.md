# Nexus docs

`docs/` dùng mô hình business-first, PRD-led.

Trục tài liệu chính:

`project-context -> PRD -> flows -> requirements -> technical-notes -> archive`

## Focus hiện tại

Bộ canonical hiện tại đang chốt MVP cho flow `audit + review CP1`.

Giá trị chính cần giữ trong mọi tài liệu:
- giúp team biết idea/tài liệu yếu ở đâu;
- biết nên sửa gì trước;
- nhận report rõ ràng;
- gửi bản sửa để được review lại.

`Case management` chỉ là lớp vận hành hỗ trợ value flow đó.

## Nguồn chuẩn

- [`project-context.md`](./project-context.md)
  - business context canonical
  - core value flow vs ops flow
  - khách hàng mục tiêu
  - ràng buộc và giả định chính
- [`prd/core-product-prd.md`](./prd/core-product-prd.md)
  - product scope canonical
  - MVP scope
  - feature list
  - screen inventory mức cao
- [`flows/`](./flows/)
  - user flow
  - operational flow
  - round flow
  - screen-level journey mức hành vi
  - screen-by-screen UX spec cho MVP
- [`requirements/`](./requirements/)
  - functional requirement canonical
  - user story
  - acceptance criteria
  - business rules theo tính năng
- [`technical-notes/`](./technical-notes/)
  - technical note tối thiểu sau khi product scope đã rõ
  - route map và component map cho frontend MVP
- [`archive/`](./archive/)
  - legacy reference
  - spec cũ
  - deferred docs

## Thứ tự đọc khuyến nghị

1. [`project-context.md`](./project-context.md)
2. [`prd/core-product-prd.md`](./prd/core-product-prd.md)
3. [`flows/cp1-audit-end-to-end-flow.md`](./flows/cp1-audit-end-to-end-flow.md)
4. [`flows/cp1-mvp-screen-spec.md`](./flows/cp1-mvp-screen-spec.md)
5. [`technical-notes/frontend-route-and-component-map.md`](./technical-notes/frontend-route-and-component-map.md)
6. các flow liên quan trong [`flows/`](./flows/)
7. các requirement liên quan trong [`requirements/`](./requirements/)
8. các note liên quan trong [`technical-notes/`](./technical-notes/)
9. `archive/` khi cần truy vết tài liệu cũ hoặc deferred scope

## Tài liệu hỗ trợ

- [`codebase-summary.md`](./codebase-summary.md)
  - tóm tắt nhanh về codebase
- [`code-standards.md`](./code-standards.md)
  - chuẩn code hỗ trợ
- [`tech-doc-urls.txt`](./tech-doc-urls.txt)
  - nguồn docs ngoài ưu tiên khi cần viết về library/framework

## Quy tắc

1. Cập nhật file canonical trước.
2. Không duplicate cùng một định nghĩa ở nhiều file.
3. Không viết technical note trước khi business context và product scope đã rõ.
4. Nếu thiếu dữ liệu, ghi `Missing`, `Unclear`, `Needs decision`, hoặc `Assumption`.
5. Không dùng `archive/` làm source of truth.
