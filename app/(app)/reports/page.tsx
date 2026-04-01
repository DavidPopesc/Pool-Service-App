import { requireRole } from "@/lib/auth";
import { Button, Card, PageHeader } from "@/components/ui";

export default async function ReportsPage() {
  await requireRole(["OWNER", "OPERATIONS_MANAGER"]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Inspection-ready compliance records and financial tracking." />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Compliance report</h2>
          <p className="mt-2 text-sm text-slate-600">Filter by date range and pool, print the page, or export CSV with service logs, chemical logs, incidents, and technician attribution.</p>
          <div className="mt-4"><Button href="/reports/compliance">Open compliance report</Button></div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Financial report</h2>
          <p className="mt-2 text-sm text-slate-600">View chemical cost totals, cost by pool, trend charting, and exportable CSV summaries.</p>
          <div className="mt-4"><Button href="/reports/financial">Open financial report</Button></div>
        </Card>
      </div>
    </div>
  );
}
