import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function MyJobsPage() {
  const user = await requireRole(["TECHNICIAN"]);
  const jobs = await db.job.findMany({
    where: { organizationId: user.organizationId, technicianId: user.id },
    include: { pool: { include: { customer: true } } },
    orderBy: { scheduledStart: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My jobs" description="Assigned service visits and pool instructions." />
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{job.pool.name}</p>
                <p className="text-sm text-slate-600">{job.pool.customer.name} · {job.pool.customer.address}</p>
              </div>
              <StatusBadge label={job.status} tone={job.status === "COMPLETED" ? "success" : "info"} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{formatDateTime(job.scheduledStart)}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-slate-500">{job.pool.careInstructions}</p>
              <a href={`/jobs/${job.id}`} className="text-sm font-medium">Open job</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
