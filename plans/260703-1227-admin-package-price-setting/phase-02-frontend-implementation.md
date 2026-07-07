# Phase 02: Frontend Implementation

## Tasks

### 1. Implement `useAdminPackages.ts` Hook `[completed]`
- **File:** `[useAdminPackages.ts](../../apps/web-1/app/admin/hooks/useAdminPackages.ts)`
- **Goal:** Create a custom react hook using `@tanstack/react-query` to fetch packages and perform price update mutation.
- **Code Outline:**
  ```typescript
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { apiClient } from "@/lib/api-client";
  import { ServicePackage } from "@/types"; // Adjust types import if needed

  export function useAdminPackages() {
    const queryClient = useQueryClient();

    const packagesQuery = useQuery<ServicePackage[]>({
      queryKey: ["admin-packages"],
      queryFn: async () => {
        // Fetch from the package list endpoint
        const response = await apiClient.get("/packages");
        return response.data;
      },
    });

    const updatePackagePriceMutation = useMutation({
      mutationFn: async ({
        packageId,
        price,
      }: {
        packageId: string;
        price: number;
      }) => {
        const response = await apiClient.put(`/admin/packages/${packageId}/price`, {
          price,
        });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      },
    });

    return {
      packages: packagesQuery.data || [],
      isLoading: packagesQuery.isLoading,
      updatePackagePrice: updatePackagePriceMutation.mutateAsync,
      isUpdating: updatePackagePriceMutation.isPending,
    };
  }
  ```

### 2. Update Admin Page Layout and Sidebar `[completed]`
- **File:** `[page.tsx](../../apps/web-1/app/admin/page.tsx)`
- **Goal:** Update the `activeSection` state definition, add a Settings/Packages option to the navbar, and render a Package Price configuration panel when the section is active.
- **Modifications Checklist:**
  - Add `"packages"` to the `activeSection` state type definition.
  - Import the `useAdminPackages` hook and call it inside the `AdminHubPage` component.
  - Add a settings icon (e.g. `Settings` or `Settings2` from `lucide-react`) in the Sidebar Nav (Primary Rail) with a Tooltip for "Cấu hình giá gói".
  - Add a corresponding option in the secondary sidebar panel to switch the filter view or select the packages section.
  - Implement a settings panel inside the main view rendering list/table of packages with `NumberInput` or inline editing form using Mantine UI v9 components (e.g., `Card`, `Table`, `NumberInput`, `Button`, `Group`, `Stack`) to allow the admin to input a new price and submit it.
  - Show success/error notifications using `@mantine/notifications` upon successful update.
