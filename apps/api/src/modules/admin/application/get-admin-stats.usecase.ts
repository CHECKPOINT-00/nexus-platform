import { prisma } from "../../../db.js";
import type { AdminStatsResponse } from "./admin-stats.dto.js";

export async function getAdminStatsUseCase(): Promise<AdminStatsResponse> {
  // 1. Total cases
  const totalCases = await prisma.case.count();

  // 2. Cases by package_id — free vs paid
  const packageGroups = await prisma.case.groupBy({
    by: ["package_id"],
    _count: true,
  });

  let freeCases = 0;
  let paidCases = 0;
  for (const g of packageGroups) {
    if (!g.package_id || g.package_id === "pkg_tf_free") {
      freeCases += g._count;
    } else {
      paidCases += g._count;
    }
  }

  // 3. Conversion rate — exclude intake/payment stages from denominator
  const nonIntakeCount = await prisma.case.count({
    where: { user_facing_stage: { not: "intake" } },
  });
  const conversionRate =
    nonIntakeCount > 0
      ? Math.round((paidCases / nonIntakeCount) * 100 * 100) / 100
      : 0;

  // 4. Total revenue from paid payments
  const revenueAgg = await prisma.payment.aggregate({
    where: { status: "paid" },
    _sum: { amount: true },
  });
  const totalRevenue = revenueAgg._sum.amount ?? 0;

  // 5. SLA breach — active cases with overdue audit rounds
  const slaResult: { count: bigint }[] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT c.id)::bigint as count
    FROM cases c
    WHERE c.internal_status NOT IN ('completed', 'cancelled')
      AND EXISTS (
        SELECT 1 FROM audit_rounds ar
        WHERE ar.case_id = c.id AND ar.sla_deadline_at < NOW()
      )
  `;
  const slaBreachCount = Number(slaResult[0]?.count ?? 0);

  // 6. Cases by stage
  const stageGroups = await prisma.case.groupBy({
    by: ["user_facing_stage"],
    _count: true,
  });
  const casesByStage: Record<string, number> = {};
  for (const g of stageGroups) {
    casesByStage[g.user_facing_stage] = g._count;
  }

  // 7. Supporter workload — batch fetch user names
  const supporterGroups = await prisma.case.groupBy({
    by: ["assigned_supporter_auth_user_id"],
    _count: true,
  });

  const assignedIds = supporterGroups
    .map((g) => g.assigned_supporter_auth_user_id)
    .filter((id): id is string => id !== null);

  const supporters =
    assignedIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: assignedIds } },
          select: { id: true, name: true },
        })
      : [];

  const nameMap = new Map(supporters.map((s) => [s.id, s.name]));

  const supporterWorkload = supporterGroups
    .filter((g) => g.assigned_supporter_auth_user_id !== null)
    .map((g) => ({
      supporterId: g.assigned_supporter_auth_user_id!,
      name: nameMap.get(g.assigned_supporter_auth_user_id!) ?? "Unknown",
      caseCount: g._count,
    }));

  // 8. Revenue by month — last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueRows: { month: string; revenue: bigint }[] = await prisma.$queryRaw`
    SELECT
      TO_CHAR(created_at, 'YYYY-MM') as month,
      COALESCE(SUM(amount), 0)::bigint as revenue
    FROM payments
    WHERE status = 'paid' AND created_at >= ${sixMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `;

  const revenueByMonth = revenueRows.map((row) => ({
    month: String(row.month),
    revenue: Number(row.revenue),
  }));

  return {
    totalCases,
    freeCases,
    paidCases,
    conversionRate,
    totalRevenue,
    slaBreachCount,
    casesByStage,
    supporterWorkload,
    revenueByMonth,
  };
}
