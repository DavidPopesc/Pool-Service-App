import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PoolForm } from "@/components/forms/pool-form";
import { Card, PageHeader } from "@/components/ui";

export default async function NewPoolPage() {
  const user = await requireRole(["OWNER"]);
  const customers = await db.customer.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (customers.length === 0) notFound();

  return (
    <div>
      <PageHeader title="New pool" description="Add a managed pool and define chemistry targets." />
      <Card><PoolForm customers={customers} mode="create" /></Card>
    </div>
  );
}
