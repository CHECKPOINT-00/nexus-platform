# Phase 03: Verification and Testing

## Tasks

### 1. Verify Backend Route Authentication and Logic `[completed]`
- **Goal:** Ensure the database update works correctly and that authorization limits access only to users with the `admin` role.
- **Verification steps:**
  - Send a `PUT /api/admin/packages/:id/price` request from an unauthorized session (e.g. guest or student account) and verify it returns a `403 Forbidden` status.
  - Send the request from an admin account with a negative price (e.g., `-1000`) and verify it returns a `400 Bad Request` validation error.
  - Send a valid request with a positive price and confirm it returns success (`200 OK`) and that the database updates successfully.

### 2. Verify UI Integration and React Query Flow `[completed]`
- **Goal:** Test the visual interface and validation behavior in the browser.
- **Verification steps:**
  - Log in as admin, navigate to `/admin`, and select the "Cấu hình giá gói" section in the navbar.
  - Verify that the list of packages is fetched and displayed correctly with current prices.
  - Modify a package's price using the input controls, click the update button, and verify that:
    - A loading state is shown while the request is pending.
    - A success toast notification is displayed using `@mantine/notifications`.
    - The UI displays the updated price correctly.
