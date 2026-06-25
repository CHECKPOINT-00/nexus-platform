import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Case, User } from "@/types";

export function useAdminCases() {
  const queryClient = useQueryClient();

  const casesQuery = useQuery<Case[]>({
    queryKey: ["admin-cases"],
    queryFn: async () => {
      const response = await apiClient.get("/cases");
      return response.data;
    },
  });

  const supportersQuery = useQuery<User[]>({
    queryKey: ["admin-supporters"],
    queryFn: async () => {
      const response = await apiClient.get("/cases/supporters");
      return response.data;
    },
  });

  const assignSupporterMutation = useMutation({
    mutationFn: async ({ caseId, supporterId }: { caseId: string; supporterId: string }) => {
      const response = await apiClient.post(`/cases/${caseId}/assign`, {
        supporter_id: supporterId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  });

  return {
    cases: casesQuery.data || [],
    isCasesLoading: casesQuery.isLoading,
    casesError: casesQuery.error,
    supporters: supportersQuery.data || [],
    isSupportersLoading: supportersQuery.isLoading,
    assignSupporter: assignSupporterMutation.mutateAsync,
    isAssigning: assignSupporterMutation.isPending,
  };
}
