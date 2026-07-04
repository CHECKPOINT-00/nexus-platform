import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Case } from "@/types";

export function useCasesList() {
  return useQuery<Case[]>({
    queryKey: ["cases"],
    queryFn: async () => {
      const response = await apiClient.get("/cases");
      return response.data;
    },
  });
}
