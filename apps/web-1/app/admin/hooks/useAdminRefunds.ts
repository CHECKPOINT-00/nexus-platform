import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useAdminRefunds() {
  const queryClient = useQueryClient();

  const refundsQuery = useQuery<any[]>({
    queryKey: ["admin-refunds"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/refunds");
      return response.data;
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: async ({
      refundId,
      decision,
      rejectionReason,
      receiptFileUrl,
    }: {
      refundId: string;
      decision: "approve" | "reject" | "complete";
      rejectionReason?: string;
      receiptFileUrl?: string;
    }) => {
      const response = await apiClient.post(`/admin/refunds/${refundId}/process`, {
        decision,
        rejection_reason: rejectionReason,
        receipt_file_url: receiptFileUrl,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
    },
  });

  return {
    refunds: refundsQuery.data || [],
    isLoading: refundsQuery.isLoading,
    error: refundsQuery.error,
    processRefund: processRefundMutation.mutateAsync,
    isProcessing: processRefundMutation.isPending,
  };
}
