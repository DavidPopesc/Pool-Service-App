import { endOfDay, startOfDay, subDays } from "date-fns";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFinancialReportData } from "@/lib/data";
import { FinancialChart } from "@/components/financial-chart";
import { PrintButton } from "@/components/print-button";
import { Button, Card, PageHeader, SectionTitle } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function FinancialReportPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; poolIds?: string; chemicalTypes?: string }>;
}) {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const params = await searchParams;
  const start = startOfDay(new Date(params.start || toDateInput(subDays(new Date(), 30))));
  const end = endOfDay(new Date(params.end || toDateInput(new Date())));
  const poolIds = params.poolIds?.split(",").filter(Boolean);
  const chemicalTypes = params.chemicalTypes?.split(",").filter(Boolean);

  const [data, pools] = await Promise.all([
    getFinancialReportData({ organizationId: user.organizationId, start, end, poolIds, chemicalTypes }),
    db.pool.findMany({ where: { organizationId: user.organizationId }, orderBy: { name: "asc" } }),
  ]);

  const exportHref = `/api/reports/financial?start=${toDateInput(start)}&end=${toDateInput(end)}&poolIds=${poolIds?.join(",") ?? ""}&chemicalTypes=${chemicalTypes?.join(",") ?? ""}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Financial report" description="Chemical usage cost trends, pool-level totals, and baseline variance." />
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Chemical types</label>
            <input name="chemicalTypes" defaultValue={chemicalTypes?.join(",") ?? ""} placeholder="Liquid chlorine,Muriatic acid" />
          </div>
          <div className="md:col-span-4 flex flex-wrap gap-3">
            <Button type="submit">Apply filters</Button>
            <Button href={exportHref} variant="ghost">Export CSV</Button>
            <PrintButton />
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total chemical cost</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(data.totalChemicalCost)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Baseline comparison</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(data.variance)}</p>
          <p className="text-sm text-slate-500">vs. prior equivalent period</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Chemical entries</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{data.logs.length}</p>
        </Card>
      </div>

      <Card>
        <SectionTitle>Usage trend</SectionTitle>
        <FinancialChart data={data.trends} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle>Cost by pool</SectionTitle>
          <div className="space-y-3">
            {data.byPool.map((item) => (
              <div key={item.poolId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.poolName}</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(item.cost)}</p>
                </div>
                <p className="text-sm text-slate-500">{item.usage.toFixed(2)} total units applied</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle>Cost by chemical</SectionTitle>
          <div className="space-y-3">
            {data.byChemical.map((item) => (
              <div key={item.chemicalType} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.chemicalType}</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(item.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
