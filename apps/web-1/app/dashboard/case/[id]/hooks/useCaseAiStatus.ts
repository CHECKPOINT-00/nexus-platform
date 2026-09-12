"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface LogEntry {
  timestamp: string;
  agent?: string;
  message: string;
}

export interface CaseAiStatusResponse {
  isAiPackage: boolean;
  jobId?: string;
  caseId?: string;
  caseCode?: string;
  projectName?: string;
  status: "queued" | "running" | "completed" | "cancelled" | "failed" | "unknown";
  startedAt?: string;
  elapsedSeconds?: number;
  logs?: LogEntry[];
  error?: string | null;
}

export function useCaseAiStatus(caseId: string, enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery<CaseAiStatusResponse>({
    queryKey: ["case-ai-status", caseId],
    queryFn: async () => {
      const response = await apiClient.get(`/cases/${caseId}/ai-status`);
      return response.data;
    },
    enabled: !!caseId && enabled,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status === "queued" || status === "running") {
        return 3000;
      }
      return false;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/cases/${caseId}/ai-cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-ai-status", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  const retryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/cases/${caseId}/ai-retry`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-ai-status", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  return {
    ...query,
    aiStatusData: query.data,
    cancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    retry: retryMutation.mutate,
    isRetrying: retryMutation.isPending,
  };
}
