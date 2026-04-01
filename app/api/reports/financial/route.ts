import { endOfDay, startOfDay } from "date-fns";
import { db } from "@/lib/db";
import { getFinancialReportData } from "@/lib/data";
import { requireApiUser, fail } from "@/lib/api";
import { csvEscape } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const start = startOfDay(new Date(searchParams.get("start") || new Date()));
    const end = endOfDay(new Date(searchParams.get("end") || new Date()));
    const poolIds = searchParams.get("poolIds")?.split(",").filter(Boolean);
    const chemicalTypes = searchParams.get("chemicalTypes")?.split(",").filter(Boolean);

    const data = await getFinancialReportData({
      organizationId: user.organizationId,
      start,
      end,
      poolIds,
      chemicalTypes,
    });

    await db.report.create({
      data: {
        organizationId: user.organizationId,
        createdById: user.id,
        name: `Financial report ${start.toISOString().slice(0, 10)}`,
        type: "FINANCIAL",
        filtersJson: JSON.stringify({ start, end, poolIds, chemicalTypes }),
      },
    });

    const rows = [
      ["pool", "chemical_type", "dosage_amount", "dosage_unit", "cost_per_unit", "total_cost", "timestamp"],
      ...data.logs.map((log) => [
        log.pool.name,
        log.chemicalType,
        log.dosageAmount,
        log.dosageUnit,
        log.costPerUnit,
        log.dosageAmount * log.costPerUnit,
        log.loggedAt.toISOString(),
      ]),
    ];

    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="financial-report.csv"',
      },
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to export report", 500);
  }
}
