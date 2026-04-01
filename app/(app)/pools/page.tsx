import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button, Card, PageHeader, StatusBadge } from "@/components/ui";

export default async function PoolsPage() {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const pools = await db.pool.findMany({
    where: { organizationId: user.organizationId },
    include: { customer: true, alerts: { where: { resolved: false } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Pools" description="Track pool configuration, chemistry ranges, and care instructions." action={user.role === "OWNER" ? <Button href="/pools/new">New pool</Button> : undefined} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pools.map((pool) => (
          <Card key={pool.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{pool.name}</p>
                <p className="text-sm text-slate-600">{pool.customer.name}</p>
              </div>
              <StatusBadge label={pool.status} tone={pool.status === "ACTIVE" ? "success" : "warning"} />
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>{pool.poolType}</p>
              <p>{pool.dimensions}</p>
              <p>{pool.estimatedVolume.toLocaleString()} gal</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge label={`${pool.alerts.length} active alerts`} tone={pool.alerts.length ? "danger" : "info"} />
              <a href={`/pools/${pool.id}`} className="text-sm font-medium">View</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
