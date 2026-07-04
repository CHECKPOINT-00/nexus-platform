import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ServicePackage } from "@/types";

export function usePackages() {
  return useQuery<ServicePackage[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const response = await apiClient.get("/packages");
      return response.data;
    },
  });
}
