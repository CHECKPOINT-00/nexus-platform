import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useCancelCase(caseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/cases/${caseId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    cancelCase: mutation.mutateAsync,
    isCancelling: mutation.isPending,
    error: mutation.error ? (mutation.error as any).response?.data?.message || "Không thể hủy hồ sơ." : null,
    reset: mutation.reset,
  };
}
