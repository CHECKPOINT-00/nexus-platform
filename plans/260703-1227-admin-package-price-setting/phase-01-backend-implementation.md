# Phase 01: Backend Implementation

## Tasks

### 1. Database Repository Update `[completed]`
- **File:** `[package.repository.ts](../../apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts)`
- **Goal:** Add an `updatePackagePrice` function to handle updating a package's price in the database.
- **Code Outline:**
  ```typescript
  export async function updatePackagePrice(id: string, price: number) {
    return await prisma.servicePackage.update({
      where: { id },
      data: { price },
    });
  }
  ```

### 2. Create Use Case `[completed]`
- **File:** `[update-package-price.usecase.ts](../../apps/api/src/modules/admin/application/update-package-price.usecase.ts)`
- **Goal:** Define a usecase to validate parameters (e.g., checking that the price is a positive integer) and call the database repository.
- **Code Outline:**
  ```typescript
  import { updatePackagePrice, findPackageById } from "../../packages/infrastructure/persistence/package.repository.js";

  export async function updatePackagePriceUseCase(packageId: string, price: number) {
    if (!packageId) {
      throw new Error("Mã gói dịch vụ không được trống");
    }
    if (typeof price !== "number" || price < 0) {
      throw new Error("Giá tiền phải là số lớn hơn hoặc bằng 0");
    }
    const pkg = await findPackageById(packageId);
    if (!pkg) {
      throw new Error("Không tìm thấy gói dịch vụ");
    }
    return await updatePackagePrice(packageId, price);
  }
  ```

### 3. Implement Controller Handler `[completed]`
- **File:** `[admin.controller.ts](../../apps/api/src/modules/admin/http/admin.controller.ts)`
- **Goal:** Export an `updatePackagePriceHandler` that authenticates the user as admin, reads request body, and calls the usecase.
- **Code Outline:**
  ```typescript
  import { updatePackagePriceUseCase } from "../application/update-package-price.usecase.js";

  export async function updatePackagePriceHandler(c: Context) {
    const authResult = await getAdminSession(c);
    if (!authResult.ok) {
      return c.json({ code: "FORBIDDEN", message: authResult.error }, authResult.status);
    }
    const packageId = c.req.param("id") || "";
    try {
      const body = await readJsonBody(c) as { price?: number };
      const price = body?.price;
      if (price === undefined) {
        return c.json({ code: "BAD_REQUEST", message: "Thiếu giá tiền" }, 400);
      }
      const result = await updatePackagePriceUseCase(packageId, price);
      return c.json({ ok: true, data: result });
    } catch (error: any) {
      return handleError(c, error);
    }
  }
  ```

### 4. Register Route in Admin Router `[completed]`
- **File:** `[admin.routes.ts](../../apps/api/src/modules/admin/http/admin.routes.ts)`
- **Goal:** Map `PUT /api/admin/packages/:id/price` to `updatePackagePriceHandler`.
- **Code Outline:**
  ```typescript
  import { updatePackagePriceHandler } from "./admin.controller.js";

  // Register in adminRouter
  adminRouter.put("/packages/:id/price", updatePackagePriceHandler);
  ```
