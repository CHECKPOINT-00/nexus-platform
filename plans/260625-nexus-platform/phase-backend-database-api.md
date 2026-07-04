# Phase Backend: Database & Core API Setup

## Goal
Khởi tạo cấu trúc các bảng nghiệp vụ trong PostgreSQL và chuẩn bị router Hono backend.

## User Outcome
Hệ thống backend đã sẵn sàng phục vụ dữ liệu và API cho các chức năng của Nexus.

## Scope
- Database Schema (Prisma) và PostgreSQL migrations.
- Router Hono API cho các phân hệ: `cases`, `reports`, `payments`, `packages`, và `ai-engine`.
- Tích hợp Better Auth server-side.

## Status
**Completed** (Đã hoàn thành - Không thay đổi code).

## Required Data / API Assumptions
N/A (Đây là tầng API cung cấp dữ liệu).

## UX Direction
N/A (Tầng dữ liệu và API).

## Key Screens
N/A (Không chứa giao diện người dùng).

## Components to Build
N/A (Không chứa UI Component).

## Implementation Steps
1. Khai báo các model mới cùng model `ServicePackage` và chỉ mục `@index` trong `schema.prisma`.
2. Chạy DB migration và tạo Prisma Client.
3. Khởi tạo và đăng ký các routes API trên Hono.

## Acceptance Criteria
- Cấu trúc DB chính xác với plural table và snake_case fields.
- API endpoints (`GET /api/cases`, v.v.) hoạt động tốt.

## Out of Scope
- Toàn bộ phần giao diện người dùng (Frontend).
