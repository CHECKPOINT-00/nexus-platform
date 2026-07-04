import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useRecallRevision(caseId: string) {
  const queryClient = useQueryClient();

  const recallMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/cases/${caseId}/revisions/recall`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    recallRevision: recallMutation.mutateAsync,
    isRecalling: recallMutation.isPending,
    error: recallMutation.error,
    reset: recallMutation.reset,
  };
}
