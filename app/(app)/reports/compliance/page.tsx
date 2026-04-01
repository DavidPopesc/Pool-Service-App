import { endOfDay, startOfDay, subDays } from "date-fns";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getComplianceReportData } from "@/lib/data";
import { PrintButton } from "@/components/print-button";
import { Button, Card, PageHeader, SectionTitle, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function ComplianceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; poolIds?: string; reportType?: string }>;
}) {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const params = await searchParams;
  const start = startOfDay(new Date(params.start || toDateInput(subDays(new Date(), 14))));
  const end = endOfDay(new Date(params.end || toDateInput(new Date())));
  const poolIds = params.poolIds?.split(",").filter(Boolean);
  const reportType = params.reportType || "full";

  const [data, pools] = await Promise.all([
    getComplianceReportData({ organizationId: user.organizationId, start, end, poolIds }),
    db.pool.findMany({ where: { organizationId: user.organizationId }, orderBy: { name: "asc" } }),
  ]);

  const exportHref = `/api/reports/compliance?start=${toDateInput(start)}&end=${toDateInput(end)}&poolIds=${poolIds?.join(",") ?? ""}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance report" description="Inspection-ready service, chemistry, and incident history." />
      <Card className="print-hidden">
        <form className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Start date</label>
            <input type="date" name="start" defaultValue={toDateInput(start)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">End date</label>
            <input type="date" name="end" defaultValue={toDateInput(end)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Pool IDs (comma separated)</label>
            <input name="poolIds" defaultValue={poolIds?.join(",") ?? ""} placeholder={pools.slice(0, 2).map((pool) => pool.id).join(",")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Report type</label>
            <select name="reportType" defaultValue={reportType}>
              <option value="full">Full report</option>
              <option value="service">Service logs only</option>
              <option value="chemicals">Chemical logs only</option>
              <option value="incidents">Incidents only</option>
            </select>
          </div>
          <div className="md:col-span-4 flex flex-wrap gap-3">
            <Button type="submit">Apply filters</Button>
            <Button href={exportHref} variant="ghost">Export CSV</Button>
            <PrintButton />
          </div>
        </form>
      </Card>

      <Card>
        <SectionTitle>Report summary</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Service logs</p><p className="text-2xl font-semibold">{data.serviceLogs.length}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Chemical logs</p><p className="text-2xl font-semibold">{data.chemicalLogs.length}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Incidents</p><p className="text-2xl font-semibold">{data.incidents.length}</p></div>
        </div>
      </Card>

      {(reportType === "full" || reportType === "service") && (
        <Card>
          <SectionTitle>Service logs</SectionTitle>
          <div className="space-y-3">
            {data.serviceLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{log.pool.name}</p>
                    <p className="text-sm text-slate-600">{log.summary}</p>
                  </div>
                  <StatusBadge label={log.technician.name} tone="info" />
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(log.submittedAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(reportType === "full" || reportType === "chemicals") && (
        <Card>
          <SectionTitle>Chemical logs</SectionTitle>
          <div className="space-y-3">
            {data.chemicalLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{log.pool.name}</p>
                    <p className="text-sm text-slate-600">{log.chemicalType} · {log.dosageAmount} {log.dosageUnit}</p>
                    <p className="text-xs text-slate-500">pH {log.phReading ?? "N/A"} · chlorine {log.chlorineReading ?? "N/A"} · alkalinity {log.alkalinityReading ?? "N/A"}</p>
                  </div>
                  <StatusBadge label={log.technician.name} tone="info" />
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(log.loggedAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(reportType === "full" || reportType === "incidents") && (
        <Card>
          <SectionTitle>Incidents</SectionTitle>
          <div className="space-y-3">
            {data.incidents.map((incident) => (
              <div key={incident.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{incident.title}</p>
                    <p className="text-sm text-slate-600">{incident.pool.name} · {incident.details}</p>
                  </div>
                  <StatusBadge label={incident.severity} tone="warning" />
                </div>
                <p className="mt-2 text-xs text-slate-500">{incident.technician.name} · {formatDateTime(incident.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
