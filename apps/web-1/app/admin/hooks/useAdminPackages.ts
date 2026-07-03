import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ServicePackage } from "@/types";

export function useAdminPackages() {
  const queryClient = useQueryClient();

  const packagesQuery = useQuery<ServicePackage[]>({
    queryKey: ["admin-packages"],
    queryFn: async () => {
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
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  return {
    packages: packagesQuery.data || [],
    isLoading: packagesQuery.isLoading,
    updatePackagePrice: updatePackagePriceMutation.mutateAsync,
    isUpdating: updatePackagePriceMutation.isPending,
  };
}
