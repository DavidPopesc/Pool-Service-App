import { endOfDay, startOfDay, subDays } from "date-fns";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

export async function getDashboardData(organizationId: string, role: Role, userId: string) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  if (role === "TECHNICIAN") {
    const [todayJobs, upcomingJobs, recentLogs] = await Promise.all([
      db.job.findMany({
        where: {
          organizationId,
          technicianId: userId,
          scheduledStart: { gte: todayStart, lte: todayEnd },
        },
        include: { pool: { include: { customer: true } } },
        orderBy: { scheduledStart: "asc" },
      }),
      db.job.findMany({
        where: {
          organizationId,
          technicianId: userId,
          scheduledStart: { gt: todayEnd },
        },
        include: { pool: { include: { customer: true } } },
        take: 5,
        orderBy: { scheduledStart: "asc" },
      }),
      db.serviceLog.findMany({
        where: { organizationId, technicianId: userId },
        include: { job: true, pool: true },
        take: 5,
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    return { todayJobs, upcomingJobs, recentLogs };
  }

  const [
    upcomingJobs,
    activeAlerts,
    recentIncidents,
    recentChemicalLogs,
    recentCustomers,
    recentServiceActivity,
    technicians,
    recentMessages,
    expenseSnapshot,
    pools,
  ] = await Promise.all([
    db.job.findMany({
      where: { organizationId, scheduledStart: { gte: todayStart } },
      include: { pool: { include: { customer: true } }, technician: true },
      take: 8,
      orderBy: { scheduledStart: "asc" },
    }),
    db.alert.findMany({
      where: { organizationId, resolved: false },
      include: { pool: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    db.incidentLog.findMany({
      where: { organizationId },
      include: { pool: true, technician: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    db.chemicalLog.findMany({
      where: { organizationId },
      include: { pool: true, technician: true },
      take: 6,
      orderBy: { loggedAt: "desc" },
    }),
    db.customer.findMany({
      where: { organizationId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.serviceLog.findMany({
      where: { organizationId },
      include: { pool: true, technician: true, job: true },
      take: 6,
      orderBy: { submittedAt: "desc" },
    }),
    db.user.findMany({
      where: { organizationId, role: "TECHNICIAN" },
      include: {
        assignedJobs: {
          where: { scheduledStart: { gte: todayStart, lte: todayEnd } },
        },
      },
    }),
    db.customerMessage.findMany({
      where: { organizationId },
      include: { customer: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.equipmentExpense.aggregate({
      where: { organizationId, incurredAt: { gte: subDays(new Date(), 30) } },
      _sum: { amount: true },
    }),
    db.pool.findMany({
      where: { organizationId },
      include: { customer: true, alerts: { where: { resolved: false } } },
      take: 8,
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    upcomingJobs,
    activeAlerts,
    recentIncidents,
    recentChemicalLogs,
    recentCustomers,
    recentServiceActivity,
    technicians,
    recentMessages,
    expenseSnapshot: expenseSnapshot._sum.amount ?? 0,
    pools,
  };
}

export async function getComplianceReportData(params: {
  organizationId: string;
  start: Date;
  end: Date;
  poolIds?: string[];
}) {
  const poolFilter = params.poolIds?.length ? { in: params.poolIds } : undefined;
  const whereBase = {
    organizationId: params.organizationId,
    poolId: poolFilter,
  };

  const [serviceLogs, chemicalLogs, incidents, pools] = await Promise.all([
    db.serviceLog.findMany({
      where: {
        ...whereBase,
        submittedAt: { gte: params.start, lte: params.end },
      },
      include: { pool: true, technician: true, job: true },
      orderBy: { submittedAt: "desc" },
    }),
    db.chemicalLog.findMany({
      where: {
        ...whereBase,
        loggedAt: { gte: params.start, lte: params.end },
      },
      include: { pool: true, technician: true, job: true },
      orderBy: { loggedAt: "desc" },
    }),
    db.incidentLog.findMany({
      where: {
        ...whereBase,
        createdAt: { gte: params.start, lte: params.end },
      },
      include: { pool: true, technician: true, job: true },
      orderBy: { createdAt: "desc" },
    }),
    db.pool.findMany({ where: { organizationId: params.organizationId }, orderBy: { name: "asc" } }),
  ]);

  return { serviceLogs, chemicalLogs, incidents, pools };
}

export async function getFinancialReportData(params: {
  organizationId: string;
  start: Date;
  end: Date;
  poolIds?: string[];
  chemicalTypes?: string[];
}) {
  const logs = await db.chemicalLog.findMany({
    where: {
      organizationId: params.organizationId,
      loggedAt: { gte: params.start, lte: params.end },
      poolId: params.poolIds?.length ? { in: params.poolIds } : undefined,
      chemicalType: params.chemicalTypes?.length ? { in: params.chemicalTypes } : undefined,
    },
    include: { pool: true, technician: true },
    orderBy: { loggedAt: "asc" },
  });

  const pools = await db.pool.findMany({
    where: { organizationId: params.organizationId },
    orderBy: { name: "asc" },
  });

  const totalChemicalCost = logs.reduce((sum, log) => sum + log.dosageAmount * log.costPerUnit, 0);

  const byPoolMap = new Map<string, { poolId: string; poolName: string; cost: number; usage: number }>();
  const byDayMap = new Map<string, { date: string; cost: number; usage: number }>();
  const byChemicalMap = new Map<string, number>();

  for (const log of logs) {
    const cost = log.dosageAmount * log.costPerUnit;
    const existingPool = byPoolMap.get(log.poolId) ?? {
      poolId: log.poolId,
      poolName: log.pool.name,
      cost: 0,
      usage: 0,
    };
    existingPool.cost += cost;
    existingPool.usage += log.dosageAmount;
    byPoolMap.set(log.poolId, existingPool);

    const key = log.loggedAt.toISOString().slice(0, 10);
    const existingDay = byDayMap.get(key) ?? { date: key, cost: 0, usage: 0 };
    existingDay.cost += cost;
    existingDay.usage += log.dosageAmount;
    byDayMap.set(key, existingDay);

    byChemicalMap.set(log.chemicalType, (byChemicalMap.get(log.chemicalType) ?? 0) + cost);
  }

  const baselineStart = subDays(params.start, Math.max(1, Math.round((params.end.getTime() - params.start.getTime()) / 86400000)));
  const baselineLogs = await db.chemicalLog.findMany({
    where: {
      organizationId: params.organizationId,
      loggedAt: { gte: baselineStart, lt: params.start },
    },
  });
  const baselineCost = baselineLogs.reduce((sum, log) => sum + log.dosageAmount * log.costPerUnit, 0);

  return {
    pools,
    logs,
    totalChemicalCost,
    byPool: Array.from(byPoolMap.values()).sort((a, b) => b.cost - a.cost),
    trends: Array.from(byDayMap.values()),
    byChemical: Array.from(byChemicalMap.entries()).map(([chemicalType, cost]) => ({ chemicalType, cost })),
    baselineCost,
    variance: totalChemicalCost - baselineCost,
  };
}
