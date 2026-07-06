import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useReactivatePayment(caseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/payments/cases/${caseId}/reactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    reactivatePayment: mutation.mutateAsync,
    isReactivating: mutation.isPending,
    error: mutation.error ? (mutation.error as any).response?.data?.message || "Không thể kích hoạt lại thanh toán." : null,
    reset: mutation.reset,
  };
}
