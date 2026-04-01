import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, PageHeader, StatusBadge } from "@/components/ui";

export default async function TeamPage() {
  const user = await requireRole(["OWNER"]);
  const members = await db.user.findMany({
    where: { organizationId: user.organizationId },
    include: { assignedJobs: { where: { status: "SCHEDULED" } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Demo roster, roles, and current assigned job load." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{member.name}</p>
                <p className="text-sm text-slate-600">{member.email}</p>
              </div>
              <StatusBadge label={member.role.replaceAll("_", " ")} tone={member.role === "TECHNICIAN" ? "info" : "success"} />
            </div>
            <p className="mt-4 text-sm text-slate-600">{member.assignedJobs.length} scheduled jobs</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
