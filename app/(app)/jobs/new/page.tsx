import { JobForm } from "@/components/forms/job-form";
import { Card, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewJobPage() {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const [pools, technicians, checklistTemplates] = await Promise.all([
    db.pool.findMany({
      where: { organizationId: user.organizationId },
      include: { customer: true },
      orderBy: { name: "asc" },
    }),
    db.user.findMany({
      where: { organizationId: user.organizationId, role: "TECHNICIAN" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.checklistTemplate.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader title="New job" description="Assign a technician, schedule the route, and attach a checklist." />
      <Card>
        <JobForm
          pools={pools.map((pool) => ({ id: pool.id, name: pool.name, customerName: pool.customer.name }))}
          technicians={technicians}
          checklistTemplates={checklistTemplates}
        />
      </Card>
    </div>
  );
}
