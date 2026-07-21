"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AdminStatsResponse {
  totalCases: number;
  freeCases: number;
  paidCases: number;
  conversionRate: number;
  totalRevenue: number;
  slaBreachCount: number;
  casesByStage: Record<string, number>;
  supporterWorkload: { supporterId: string; name: string; caseCount: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export function useAdminStats() {
  return useQuery<AdminStatsResponse>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/stats");
      return response.data;
    },
  });
}
