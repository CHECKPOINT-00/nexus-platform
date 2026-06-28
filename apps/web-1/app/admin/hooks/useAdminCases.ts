import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Case, User } from "@/types";

export function useAdminCases() {
  const queryClient = useQueryClient();

  const casesQuery = useQuery<any[]>({
    queryKey: ["admin-cases"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/cases");
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

  const acceptCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      const response = await apiClient.post(`/admin/cases/${caseId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  });

  const rejectCaseMutation = useMutation({
    mutationFn: async ({ caseId, reason }: { caseId: string; reason: string }) => {
      const response = await apiClient.post(`/admin/cases/${caseId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  });

  const requestMoreInfoMutation = useMutation({
    mutationFn: async ({ caseId, query }: { caseId: string; query: string }) => {
      const response = await apiClient.post(`/admin/cases/${caseId}/request-more-info`, { query });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  });

  const assignSupporterMutation = useMutation({
    mutationFn: async ({ caseId, supporterId }: { caseId: string; supporterId: string }) => {
      const response = await apiClient.post(`/admin/cases/${caseId}/assign`, {
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
    acceptCase: acceptCaseMutation.mutateAsync,
    isAccepting: acceptCaseMutation.isPending,
    rejectCase: rejectCaseMutation.mutateAsync,
    isRejecting: rejectCaseMutation.isPending,
    requestMoreInfo: requestMoreInfoMutation.mutateAsync,
    isRequestingMoreInfo: requestMoreInfoMutation.isPending,
    assignSupporter: assignSupporterMutation.mutateAsync,
    isAssigning: assignSupporterMutation.isPending,
  };
}

export function useAdminCaseDetail(caseId: string | null) {
  return useQuery<any>({
    queryKey: ["admin-case-detail", caseId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/cases/${caseId}`);
      return response.data;
    },
    enabled: !!caseId,
  });
}
