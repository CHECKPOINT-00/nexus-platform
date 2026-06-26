import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Report } from "@/types";

export function useReportReview(caseId: string) {
  const queryClient = useQueryClient();

  // 1. Get draft report for this case
  const draftQuery = useQuery<Report | null>({
    queryKey: ["case-report-draft", caseId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/supporter/cases/${caseId}/reports/draft`);
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null; // No draft exists yet
        }
        throw err;
      }
    },
    enabled: !!caseId,
  });

  // 2. Generate AI Draft Report
  const generateDraftMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/supporter/cases/${caseId}/reports/draft`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-report-draft", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  // 3. Edit / Save Draft
  const updateDraftMutation = useMutation({
    mutationFn: async ({ reportId, contentMd }: { reportId: string; contentMd: string }) => {
      const response = await apiClient.put(`/supporter/reports/${reportId}`, { content_md: contentMd });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["case-report-draft", caseId], data);
    },
  });

  // 4. Publish report
  const publishReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiClient.post(`/supporter/reports/${reportId}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-report-draft", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case-report-latest", caseId] });
    },
  });

  // 5. Request more info from student (Supporter version)
  const requestMoreInfoMutation = useMutation({
    mutationFn: async ({ query }: { query: string }) => {
      const response = await apiClient.post(`/supporter/cases/${caseId}/request-more-info`, { query });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  // 6. Close case
  const closeCaseMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiClient.post(`/supporter/cases/${caseId}/close`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    draftReport: draftQuery.data,
    isLoading: draftQuery.isLoading,
    error: draftQuery.error,
    generateDraft: generateDraftMutation.mutateAsync,
    isGenerating: generateDraftMutation.isPending,
    updateDraft: updateDraftMutation.mutateAsync,
    isUpdating: updateDraftMutation.isPending,
    approveReport: publishReportMutation.mutateAsync, // Keep name approveReport for backward compatibility
    isApproving: publishReportMutation.isPending,
    requestMoreInfo: requestMoreInfoMutation.mutateAsync,
    isRequestingMoreInfo: requestMoreInfoMutation.isPending,
    closeCase: closeCaseMutation.mutateAsync,
    isClosing: closeCaseMutation.isPending,
  };
}
