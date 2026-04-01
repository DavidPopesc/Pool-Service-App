import { format } from "date-fns";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button, Card, PageHeader, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SchedulePage() {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const jobs = await db.job.findMany({
    where: { organizationId: user.organizationId },
    include: { pool: { include: { customer: true } }, technician: true },
    orderBy: [{ scheduledStart: "asc" }, { routeOrder: "asc" }],
  });

  const groups = jobs.reduce<Record<string, typeof jobs>>((acc, job) => {
    const key = format(job.scheduledStart, "yyyy-MM-dd");
    acc[key] = acc[key] ?? [];
    acc[key].push(job);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule" description="Daily route view for upcoming service visits." action={<Button href="/jobs/new">Create job</Button>} />
      <div className="space-y-5">
        {Object.entries(groups).map(([date, items]) => (
          <Card key={date}>
            <h2 className="text-lg font-semibold text-slate-900">{format(new Date(date), "EEEE, MMM d")}</h2>
            <div className="mt-4 space-y-3">
              {items.map((job) => (
                <div key={job.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-600">{job.pool.name} · {job.pool.customer.name} · {job.technician?.name ?? "Unassigned"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={`Route ${job.routeOrder ?? "-"}`} tone="info" />
                      <StatusBadge label={job.status} tone={job.status === "COMPLETED" ? "success" : "warning"} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{formatDateTime(job.scheduledStart)} - {formatDateTime(job.scheduledEnd)}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
