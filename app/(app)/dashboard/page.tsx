import { Role } from "@prisma/client";
import { Card, EmptyState, PageHeader, SectionTitle, StatCard, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const data: any = await getDashboardData(user.organizationId, user.role, user.id);

  if (user.role === Role.TECHNICIAN) {
    return (
      <div className="space-y-6">
        <PageHeader title="Technician Dashboard" description="Today’s route, upcoming jobs, and your recent submitted work." />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Today's jobs" value={data.todayJobs.length} />
          <StatCard label="Upcoming jobs" value={data.upcomingJobs.length} />
          <StatCard label="Recent logs" value={data.recentLogs.length} />
        </div>
        <Card>
          <SectionTitle>Today&apos;s assigned jobs</SectionTitle>
          {data.todayJobs.length === 0 ? <EmptyState title="No jobs today" description="Your route is clear right now." /> : (
            <div className="space-y-3">
              {data.todayJobs.map((job: any) => (
                <div key={job.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{job.pool.name}</p>
                      <p className="text-sm text-slate-600">{job.pool.customer.name} · {job.pool.customer.address}</p>
                    </div>
                    <div className="text-sm text-slate-500">{formatDateTime(job.scheduledStart)}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge label={job.status} tone={job.status === "COMPLETED" ? "success" : "info"} />
                    <a href={`/jobs/${job.id}`} className="text-sm font-medium">Open job</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <SectionTitle>Upcoming jobs</SectionTitle>
            <div className="space-y-3">
              {data.upcomingJobs.map((job: any) => (
                <div key={job.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{job.pool.name}</p>
                  <p className="text-sm text-slate-600">{formatDateTime(job.scheduledStart)}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>Recent submitted logs</SectionTitle>
            <div className="space-y-3">
              {data.recentLogs.map((log: any) => (
                <div key={log.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{log.pool.name}</p>
                  <p className="text-sm text-slate-600">{log.summary}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(log.submittedAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = user.role === Role.OWNER;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwner ? "Owner Dashboard" : "Operations Dashboard"}
        description={isOwner ? "Scheduling, customer growth, technician load, and customer communication in one view." : "Chemistry oversight, alerts, incidents, and reporting readiness across all pools."}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming jobs" value={data.upcomingJobs.length} />
        <StatCard label="Active alerts" value={data.activeAlerts.length} detail={isOwner ? "Visibility into chemistry issues" : "Inspection focus"} />
        <StatCard label="Tracked pools" value={data.pools.length} />
        <StatCard label="30-day equipment spend" value={formatCurrency(data.expenseSnapshot)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <SectionTitle>{isOwner ? "Upcoming jobs" : "All pools overview"}</SectionTitle>
          <div className="space-y-3">
            {(isOwner ? data.upcomingJobs : data.pools).map((item: any) => (
              "scheduledStart" in item ? (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.pool.name}</p>
                      <p className="text-sm text-slate-600">{item.pool.customer.name} · {item.technician?.name ?? "Unassigned"}</p>
                    </div>
                    <div className="text-sm text-slate-500">{formatDateTime(item.scheduledStart)}</div>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">{item.customer.name} · {item.poolType}</p>
                    </div>
                    <StatusBadge label={`${item.alerts.length} alerts`} tone={item.alerts.length ? "danger" : "success"} />
                  </div>
                </div>
              )
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>{isOwner ? "Technician workload" : "Active alerts"}</SectionTitle>
          <div className="space-y-3">
            {(isOwner ? data.technicians : data.activeAlerts).map((item: any) => (
              "assignedJobs" in item ? (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">{item.assignedJobs.length} jobs scheduled today</p>
                </div>
              ) : (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.pool.name}</p>
                  <p className="text-sm text-rose-700">{item.message}</p>
                </div>
              )
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle>{isOwner ? "Recent service activity" : "Recent chemical logs"}</SectionTitle>
          <div className="space-y-3">
            {(isOwner ? data.recentServiceActivity : data.recentChemicalLogs).map((item: any) => (
              "summary" in item ? (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.pool.name}</p>
                  <p className="text-sm text-slate-600">{item.summary}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.technician.name} · {formatDateTime(item.submittedAt)}</p>
                </div>
              ) : (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.pool.name}</p>
                  <p className="text-sm text-slate-600">{item.chemicalType} · {item.dosageAmount} {item.dosageUnit}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.technician.name} · {formatDateTime(item.loggedAt)}</p>
                </div>
              )
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle>{isOwner ? "Customer update activity" : "Recent incidents"}</SectionTitle>
          <div className="space-y-3">
            {(isOwner ? data.recentMessages : data.recentIncidents).map((item: any) => (
              "subject" in item ? (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.customer.name}</p>
                  <p className="text-sm text-slate-600">{item.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.status} · {formatDateTime(item.createdAt)}</p>
                </div>
              ) : (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.pool.name} · {item.severity}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.technician.name} · {formatDateTime(item.createdAt)}</p>
                </div>
              )
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
