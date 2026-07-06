import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useRequestRefund(caseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (reason?: string) => {
      const response = await apiClient.post(`/payments/cases/${caseId}/refund`, {
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    requestRefund: mutation.mutateAsync,
    isRequesting: mutation.isPending,
    error: mutation.error ? (mutation.error as any).response?.data?.message || "Không thể yêu cầu hoàn tiền." : null,
    reset: mutation.reset,
  };
}
