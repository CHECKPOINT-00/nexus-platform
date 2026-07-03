# Changelog

All notable changes to the Nexus Platform project will be documented in this file.

## [Unreleased] - 2026-07-03

### Added
- **Admin Package Price Configuration (F07):** Added backend API and admin console interface to dynamically configure and update package prices.
  - **Backend API endpoint:** `PUT /api/admin/packages/:id/price` with validation requiring non-negative prices and `admin` role authorization.
  - **Application usecase:** Created `updatePackagePriceUseCase` in `apps/api/src/modules/admin/application/update-package-price.usecase.ts` to enforce pricing logic.
  - **Database integration:** Implemented database updates via `updatePackagePrice` in `package.repository.ts`.
  - **Frontend custom hook:** Created `useAdminPackages` in `apps/web-1/app/admin/hooks/useAdminPackages.ts` using `@tanstack/react-query` to fetch packages and perform mutation updates.
  - **Admin UI Settings panel:** Added `AdminPackagesSettings` UI view using Mantine UI components (`Card`, `Table`, `NumberInput`, `Button`, `Group`, `Stack`) in `apps/web-1/app/admin/_components/AdminPackagesSettings.tsx` and integrated it into the admin workspace sidebar & pages.
  - **User Notifications:** Added visual notifications for update status (success/error) using `@mantine/notifications`.

### Modified
- **PRD (`docs/prd/core-product-prd.md`):** Promoted packages pricing from a deferred feature list to an active and implemented feature `F07`.
- **Requirements (`docs/requirements/packages-pricing-and-payment-proof.md`):** Updated the status of packages and pricing configuration from `Deferred` to `Implemented`, detailing the API payload/schema and UI component architecture.
- **Project Context (`docs/project-context.md`):** Noted implementation of the dynamic packages pricing console inside the MVP phase decisions.
- **Codebase Summary (`docs/codebase-summary.md`):** Documented the new database, API controller, hook, and panel file structures within the codebase layout.
