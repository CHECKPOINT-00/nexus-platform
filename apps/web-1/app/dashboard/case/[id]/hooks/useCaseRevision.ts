import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useCaseRevision(caseId: string) {
  const queryClient = useQueryClient();

  const submitRevisionMutation = useMutation({
    mutationFn: async ({
      changeSummary,
      documents,
      remainingBlockers,
    }: {
      changeSummary: string;
      documents: Array<{ drive_url: string; document_type: string; role_description: string }>;
      remainingBlockers?: string;
    }) => {
      const response = await apiClient.post(`/cases/${caseId}/revisions`, {
        change_summary: changeSummary,
        documents,
        remaining_blockers: remainingBlockers || undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    submitRevision: submitRevisionMutation.mutateAsync,
    isSubmitting: submitRevisionMutation.isPending,
    error: submitRevisionMutation.error,
    reset: submitRevisionMutation.reset,
  };
}
