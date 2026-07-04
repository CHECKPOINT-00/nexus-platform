# Ghi chú kiến trúc platform

## Mục đích

Đây là note kỹ thuật tối thiểu để nối PRD và requirements với các quyết định technical đã được chốt.

## Anchor hiện tại của platform

- Web app: `apps/web-1`
- API: `apps/api`
- DB schema: `prisma/schema.prisma`
- Chủ sở hữu auth/session: `apps/api`

## Tài liệu kỹ thuật tham chiếu

- [`../archive/system-architecture.md`](../archive/system-architecture.md)
- [`../archive/architecture/structured-workflow-and-ai-ops.md`](../archive/architecture/structured-workflow-and-ai-ops.md)
- [`../archive/architecture/case-lifecycle-and-storage-model.md`](../archive/architecture/case-lifecycle-and-storage-model.md)
- [`../archive/standards/authz-and-data-boundaries.md`](../archive/standards/authz-and-data-boundaries.md)

## Ghi chú

- Technical notes chỉ nên được thêm sau khi feature đã có trong PRD và requirement.
- Chỉ ghi data/API/auth impact tối thiểu cần cho implementation.
