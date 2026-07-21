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
