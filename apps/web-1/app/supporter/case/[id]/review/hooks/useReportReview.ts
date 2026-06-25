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
        const response = await apiClient.get(`/reports/${caseId}/draft`);
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
      const response = await apiClient.post(`/reports/${caseId}/draft`);
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
      const response = await apiClient.put(`/reports/${reportId}`, { content_md: contentMd });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["case-report-draft", caseId], data);
    },
  });

  // 4. Approve and send report to student
  const approveReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiClient.post(`/reports/${reportId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-report-draft", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case-report-latest", caseId] });
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
    approveReport: approveReportMutation.mutateAsync,
    isApproving: approveReportMutation.isPending,
  };
}
