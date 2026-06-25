import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Case } from "@/types";

export function useCaseDetails(id: string) {
  const queryClient = useQueryClient();

  const caseQuery = useQuery<Case>({
    queryKey: ["case", id],
    queryFn: async () => {
      const response = await apiClient.get(`/cases/${id}`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 10000, // Poll every 10 seconds for real-time status/report updates
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ stage, status }: { stage?: string; status?: string }) => {
      const response = await apiClient.post(`/cases/${id}/status`, { stage, status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", id] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: { team_name?: string; school?: string; course_context?: string; group_no?: string }) => {
      const response = await apiClient.put(`/cases/${id}/settings`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", id] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
    },
  });

  return {
    caseData: caseQuery.data,
    isLoading: caseQuery.isLoading,
    error: caseQuery.error,
    refetch: caseQuery.refetch,
    updateStage: updateStageMutation.mutateAsync,
    isUpdatingStage: updateStageMutation.isPending,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdatingSettings: updateSettingsMutation.isPending,
  };
}
