import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button, Card, PageHeader, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function JobsPage() {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const jobs = await db.job.findMany({
    where: { organizationId: user.organizationId },
    include: { pool: { include: { customer: true } }, technician: true, serviceLog: true },
    orderBy: { scheduledStart: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Assignment tracking across all scheduled pool visits." action={<Button href="/jobs/new">New job</Button>} />
      <Card className="overflow-hidden p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Pool</th>
              <th className="px-4 py-3">Technician</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-slate-200">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-slate-500">{job.notes || "No notes"}</p>
                </td>
                <td className="px-4 py-3">{job.pool.name}<div className="text-slate-500">{job.pool.customer.name}</div></td>
                <td className="px-4 py-3">{job.technician?.name ?? "Unassigned"}</td>
                <td className="px-4 py-3">{formatDateTime(job.scheduledStart)}</td>
                <td className="px-4 py-3"><StatusBadge label={job.status} tone={job.serviceLog ? "success" : "warning"} /></td>
                <td className="px-4 py-3 text-right"><a href={`/jobs/${job.id}`} className="font-medium">Open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
