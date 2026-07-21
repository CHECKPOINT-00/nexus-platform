# Plan: Admin Package Price Setting

## Context
Currently, the service packages and their corresponding pricing details are stored in the database schema as `ServicePackage`. However, there is no interface or API endpoint dedicated to allowing administrators to dynamically update these prices from the admin panel interface.

## Goal
Implement a secure, admin-only endpoint and UI component to update package prices using Mantine UI components.

## Phases
- **[Phase 01: Backend implementation](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/plans/260703-1227-admin-package-price-setting/phase-01-backend-implementation.md)** - `[completed]`
- **[Phase 02: Frontend implementation](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/plans/260703-1227-admin-package-price-setting/phase-02-frontend-implementation.md)** - `[completed]`
- **[Phase 03: Verification and testing](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/plans/260703-1227-admin-package-price-setting/phase-03-verification-and-testing.md)** - `[completed]`

## Key Constraints & Dependencies
1. **Access Authorization:** Only users with `role: "admin"` should be permitted to call the backend endpoint.
2. **Data Integrity:** Price must be updated as a positive integer or zero (no negative prices).
3. **UI Styling:** Implementation in the web application must use Mantine UI components matching the existing layout style.

## Main Touch Areas
- Database Layer:
  - `[package.repository.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts)`
- Business/Application Layer:
  - `[update-package-price.usecase.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/admin/application/update-package-price.usecase.ts)`
- HTTP Layer:
  - `[admin.controller.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/admin/http/admin.controller.ts)`
  - `[admin.routes.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/modules/admin/http/admin.routes.ts)`
- Web Frontend Client Layer:
  - `[useAdminPackages.ts](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/hooks/useAdminPackages.ts)`
  - `[page.tsx](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web-1/app/admin/page.tsx)`
