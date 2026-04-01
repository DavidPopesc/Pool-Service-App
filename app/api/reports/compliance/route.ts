import { endOfDay, startOfDay } from "date-fns";
import { db } from "@/lib/db";
import { getComplianceReportData } from "@/lib/data";
import { requireApiUser, fail } from "@/lib/api";
import { csvEscape } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const start = startOfDay(new Date(searchParams.get("start") || new Date()));
    const end = endOfDay(new Date(searchParams.get("end") || new Date()));
    const poolIds = searchParams.get("poolIds")?.split(",").filter(Boolean);

    const data = await getComplianceReportData({
      organizationId: user.organizationId,
      start,
      end,
      poolIds,
    });

    await db.report.create({
      data: {
        organizationId: user.organizationId,
        createdById: user.id,
        name: `Compliance report ${start.toISOString().slice(0, 10)}`,
        type: "COMPLIANCE",
        filtersJson: JSON.stringify({ start, end, poolIds }),
      },
    });

    const rows = [
      ["section", "pool", "technician", "timestamp", "summary"],
      ...data.serviceLogs.map((log) => ["service_log", log.pool.name, log.technician.name, log.submittedAt.toISOString(), log.summary]),
      ...data.chemicalLogs.map((log) => ["chemical_log", log.pool.name, log.technician.name, log.loggedAt.toISOString(), `${log.chemicalType} ${log.dosageAmount} ${log.dosageUnit}`]),
      ...data.incidents.map((incident) => ["incident", incident.pool.name, incident.technician.name, incident.createdAt.toISOString(), `${incident.title}: ${incident.details}`]),
    ];

    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="compliance-report.csv"',
      },
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to export report", 500);
  }
}
