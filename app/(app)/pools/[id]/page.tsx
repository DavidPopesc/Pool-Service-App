import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PoolForm } from "@/components/forms/pool-form";
import { Card, PageHeader, SectionTitle, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default async function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const { id } = await params;
  const [pool, customers] = await Promise.all([
    db.pool.findUnique({
      where: { id },
      include: {
        customer: true,
        alerts: { where: { resolved: false }, orderBy: { createdAt: "desc" } },
        serviceLogs: { include: { technician: true }, orderBy: { submittedAt: "desc" }, take: 8 },
        chemicalLogs: { include: { technician: true }, orderBy: { loggedAt: "desc" }, take: 8 },
      },
    }),
    db.customer.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!pool || pool.organizationId !== user.organizationId) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={pool.name} description={`${pool.customer.name} · ${pool.poolType}`} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionTitle>{user.role === "OWNER" ? "Edit pool" : "Pool profile"}</SectionTitle>
          {user.role === "OWNER" ? (
            <PoolForm
              customers={customers}
              mode="edit"
              pool={{
                id: pool.id,
                customerId: pool.customerId,
                name: pool.name,
                poolType: pool.poolType,
                dimensions: pool.dimensions,
                estimatedVolume: pool.estimatedVolume,
                careInstructions: pool.careInstructions,
                targetPhMin: pool.targetPhMin,
                targetPhMax: pool.targetPhMax,
                targetChlorineMin: pool.targetChlorineMin ?? undefined,
                targetChlorineMax: pool.targetChlorineMax ?? undefined,
                notes: pool.notes ?? "",
                status: pool.status,
              }}
            />
          ) : (
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-medium text-slate-900">Dimensions:</span> {pool.dimensions}</p>
              <p><span className="font-medium text-slate-900">Volume:</span> {pool.estimatedVolume.toLocaleString()} gal</p>
              <p><span className="font-medium text-slate-900">Care instructions:</span> {pool.careInstructions}</p>
              <p><span className="font-medium text-slate-900">Target pH:</span> {pool.targetPhMin} - {pool.targetPhMax}</p>
              <p><span className="font-medium text-slate-900">Target chlorine:</span> {pool.targetChlorineMin ?? "N/A"} - {pool.targetChlorineMax ?? "N/A"}</p>
            </div>
          )}
        </Card>
        <div className="space-y-6">
          <Card>
            <SectionTitle>Active alerts</SectionTitle>
            <div className="space-y-3">
              {pool.alerts.length === 0 ? <p className="text-sm text-slate-500">No active alerts.</p> : pool.alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{alert.message}</p>
                    <StatusBadge label={alert.type} tone="danger" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(alert.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>Recent service history</SectionTitle>
            <div className="space-y-3">
              {pool.serviceLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{log.summary}</p>
                  <p className="text-sm text-slate-600">{log.technician.name} · {formatDateTime(log.submittedAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
