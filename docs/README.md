# Nexus docs

`docs/` dùng mô hình business-first, PRD-led.

Trục tài liệu chính:

`project-context -> PRD -> flows -> requirements -> technical-notes -> archive`

## Focus hiện tại

Bộ canonical hiện tại đang chốt MVP cho flow `audit + review CP1`, trình bày như workflow `student -> admin -> supporter` xoay quanh `Hồ sơ phản biện`, `Tài liệu minh chứng`, `Báo cáo phản biện`, và các vòng sửa trong cùng case workspace.

Giá trị chính cần giữ trong mọi tài liệu:
- giúp team biết tài liệu hoặc hướng làm đang yếu ở đâu;
- biết nên sửa gì trước;
- nhận report rõ ràng;
- gửi bản sửa để được review lại;
- theo dõi trao đổi, tài liệu, và tiến độ xử lý trong cùng một workspace.

`Case management` chỉ là lớp vận hành hỗ trợ value flow đó.

## Nguồn chuẩn

- [`project-context.md`](./project-context.md)
  - business context canonical
  - core value flow vs ops flow
  - khách hàng mục tiêu
  - ràng buộc và giả định chính
- [`project-overview-pdr.md`](./project-overview-pdr.md)
  - canonical ngắn cho MVP demo realignment
  - student -> admin -> supporter workflow
  - những gì giữ / sửa / hoãn trước demo
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
2. [`project-overview-pdr.md`](./project-overview-pdr.md)
3. [`prd/core-product-prd.md`](./prd/core-product-prd.md)
4. [`system-architecture.md`](./system-architecture.md)
5. [`flows/cp1-audit-end-to-end-flow.md`](./flows/cp1-audit-end-to-end-flow.md)
6. [`flows/cp1-mvp-screen-spec.md`](./flows/cp1-mvp-screen-spec.md)
7. [`technical-notes/frontend-route-and-component-map.md`](./technical-notes/frontend-route-and-component-map.md)
8. các flow liên quan trong [`flows/`](./flows/)
9. các requirement liên quan trong [`requirements/`](./requirements/)
10. các note liên quan trong [`technical-notes/`](./technical-notes/)
11. `archive/` khi cần truy vết tài liệu cũ hoặc deferred scope

## Tài liệu hỗ trợ

- [`codebase-summary.md`](./codebase-summary.md)
  - tóm tắt nhanh về codebase
  - verified implementation surfaces cho MVP hiện tại
- [`code-standards.md`](./code-standards.md)
  - chuẩn code hỗ trợ
  - guardrails khi cập nhật MVP demo realignment
- [`system-architecture.md`](./system-architecture.md)
  - architecture hiện trạng bám codebase
  - document workspace, payment surface phụ, và shared shell hiện tại
- [`tech-doc-urls.txt`](./tech-doc-urls.txt)
  - nguồn docs ngoài ưu tiên khi cần viết về library/framework

## Quy tắc

1. Cập nhật file canonical trước.
2. Không duplicate cùng một định nghĩa ở nhiều file.
3. Không viết technical note trước khi business context và product scope đã rõ.
4. Nếu thiếu dữ liệu, ghi `Missing`, `Unclear`, `Needs decision`, hoặc `Assumption`.
5. Không dùng `archive/` làm source of truth.
