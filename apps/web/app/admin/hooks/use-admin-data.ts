"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminCase, Supporter, AdminPayment } from "../types";

interface UseAdminDataOptions {
  enabled: boolean;
}

export function useAdminData({ enabled }: UseAdminDataOptions) {
  const queryClient = useQueryClient();

  const { data: cases, isLoading: loadingCases } = useQuery<AdminCase[]>({
    queryKey: ["admin-cases"],
    queryFn: () => apiClient<AdminCase[]>("/api/cases"),
    enabled,
  });

  const { data: supporters, isLoading: loadingSupporters } = useQuery<Supporter[]>({
    queryKey: ["supporters-list"],
    queryFn: () => apiClient<Supporter[]>("/api/cases/supporters"),
    enabled,
  });

  const { data: payments, isLoading: loadingPayments } = useQuery<AdminPayment[]>({
    queryKey: ["admin-payments"],
    queryFn: () => apiClient<AdminPayment[]>("/api/payments"),
    enabled,
  });

  const assignMutation = useMutation({
    mutationFn: ({ caseId, supporterId }: { caseId: string; supporterId: string }) =>
      apiClient(`/api/cases/${caseId}/assign`, {
        method: "POST",
        json: { supporter_id: supporterId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: ({
      paymentId,
      status,
      reason,
    }: {
      paymentId: string;
      status: "paid" | "rejected";
      reason?: string;
    }) =>
      apiClient(`/api/payments/${paymentId}/verify`, {
        method: "POST",
        json: { status, rejection_reason: reason },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
    },
  });

  return {
    cases, loadingCases,
    supporters, loadingSupporters,
    payments, loadingPayments,
    assignMutation,
    verifyPaymentMutation,
  };
}
