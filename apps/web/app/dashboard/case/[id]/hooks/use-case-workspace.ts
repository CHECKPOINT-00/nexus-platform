"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "@heroui/react";
import { apiClient } from "../../../../../lib/api-client";
import { authClient } from "../../../../../lib/auth-client";
import type { CaseDetails, Message, Finding } from "../types";

export function useCaseWorkspace(caseId: string) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  // Fetch case details
  const { data: c, isLoading } = useQuery<CaseDetails>({
    queryKey: ["case", caseId],
    queryFn: () => apiClient<CaseDetails>(`/api/cases/${caseId}`),
    enabled: !!caseId,
  });

  // Fetch case messages
  const { data: messages } = useQuery<Message[]>({
    queryKey: ["messages", caseId],
    queryFn: () => apiClient<Message[]>(`/api/cases/${caseId}/messages`),
    enabled: !!caseId,
  });

  // Mutation: Send message
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient(`/api/cases/${caseId}/messages`, {
        method: "POST",
        json: { content },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", caseId] });
    },
  });

  // Mutation: Generate AI Report Draft
  const generateDraftMutation = useMutation({
    mutationFn: () =>
      apiClient(`/api/reports/${caseId}/draft`, {
        method: "POST",
        json: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  // Mutation: Save Report Draft
  const saveDraftMutation = useMutation({
    mutationFn: ({ reportId, content }: { reportId: string; content: string }) =>
      apiClient(`/api/reports/${reportId}`, {
        method: "PUT",
        json: { content_md: content },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      toast.success("Đã lưu bản nháp!");
    },
  });

  // Mutation: Approve report
  const approveReportMutation = useMutation({
    mutationFn: (reportId: string) =>
      apiClient(`/api/reports/${reportId}/approve`, {
        method: "POST",
        json: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  // Role checks
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const isSupporter = (session?.user as { role?: string })?.role === "supporter" || isAdmin;
  const isOwner = c?.owner_auth_user_id === session?.user?.id;
  const currentUserId = session?.user?.id;

  // Derived data
  const versions = useMemo(() => {
    if (!c?.checkpoints) return [];
    return c.checkpoints
      .flatMap((cp) => cp.lifecycle_units)
      .sort((a, b) => b.version_no - a.version_no);
  }, [c]);

  const draftReport = useMemo(
    () => c?.reports.find((r) => r.status === "draft"),
    [c]
  );

  const approvedReport = useMemo(
    () => c?.reports.find((r) => r.status === "APPROVED"),
    [c]
  );

  const approvedFindings = useMemo<Finding[]>(() => {
    if (!approvedReport?.content_md) return [];
    try {
      const obj = JSON.parse(approvedReport.content_md);
      return obj.findings || [];
    } catch {
      return [];
    }
  }, [approvedReport]);

  const draftFindings = useMemo<Finding[]>(() => {
    if (!draftReport?.content_md) return [];
    try {
      const obj = JSON.parse(draftReport.content_md);
      return obj.findings || [];
    } catch {
      return [];
    }
  }, [draftReport]);

  return {
    c,
    isLoading,
    messages,
    session,
    currentUserId,
    isAdmin,
    isSupporter,
    isOwner,
    versions,
    draftReport,
    approvedReport,
    approvedFindings,
    draftFindings,
    sendMessageMutation,
    generateDraftMutation,
    saveDraftMutation,
    approveReportMutation,
  };
}
