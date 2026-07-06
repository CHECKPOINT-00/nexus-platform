import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useConfirmPackage(caseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (acceptProposed: boolean) => {
      const response = await apiClient.post(`/payments/cases/${caseId}/confirm-package`, {
        acceptProposed,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    confirmPackage: mutation.mutateAsync,
    isConfirming: mutation.isPending,
    error: mutation.error ? (mutation.error as any).response?.data?.message || "Không thể xác nhận gói." : null,
    reset: mutation.reset,
  };
}
