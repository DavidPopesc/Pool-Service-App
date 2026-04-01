import { JobStatus, WaterLevelStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { generateAlertsForChemicalLog } from "@/lib/alerts";
import { requireApiUser, fail, ok } from "@/lib/api";
import { chemicalLogSchema, incidentSchema, serviceLogSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireApiUser();
    const body = await request.json();

    const job = await db.job.findUnique({
      where: { id },
      include: { checklistItems: true, pool: true },
    });

    if (!job || job.organizationId !== user.organizationId) return fail("Job not found", 404);
    if (user.role === "TECHNICIAN" && job.technicianId !== user.id) return fail("Forbidden", 403);

    const checklistIds: string[] = Array.isArray(body.checklistCompletedIds) ? body.checklistCompletedIds : [];
    const serviceParsed = serviceLogSchema.safeParse({
      summary: body.summary,
      observations: body.observations,
      waterLevelStatus: body.waterLevelStatus ?? WaterLevelStatus.NORMAL,
    });
    if (!serviceParsed.success) return fail(serviceParsed.error.issues[0]?.message ?? "Invalid service log");

    const chemicalEntries = Array.isArray(body.chemicalEntries) ? body.chemicalEntries : [];
    const incidentEntries = Array.isArray(body.incidentEntries) ? body.incidentEntries : [];

    for (const entry of chemicalEntries) {
      const parsed = chemicalLogSchema.safeParse(entry);
      if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid chemical log");
    }

    for (const entry of incidentEntries) {
      const parsed = incidentSchema.safeParse(entry);
      if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid incident log");
    }

    await db.$transaction(async (tx) => {
      await tx.jobChecklistItem.updateMany({
        where: { jobId: id },
        data: { completed: false, completedAt: null, completedById: null },
      });

      if (checklistIds.length > 0) {
        await Promise.all(
          checklistIds.map((itemId) =>
            tx.jobChecklistItem.update({
              where: { id: itemId },
              data: { completed: true, completedAt: new Date(), completedById: user.id },
            }),
          ),
        );
      }

      await tx.serviceLog.upsert({
        where: { jobId: id },
        update: {
          summary: serviceParsed.data.summary,
          observations: serviceParsed.data.observations,
          waterLevelStatus: serviceParsed.data.waterLevelStatus,
          technicianId: user.id,
          submittedAt: new Date(),
        },
        create: {
          organizationId: user.organizationId,
          jobId: id,
          poolId: job.poolId,
          technicianId: user.id,
          summary: serviceParsed.data.summary,
          observations: serviceParsed.data.observations,
          waterLevelStatus: serviceParsed.data.waterLevelStatus,
        },
      });

      for (const entry of chemicalEntries) {
        const parsed = chemicalLogSchema.parse(entry);
        const chemicalLog = await tx.chemicalLog.create({
          data: {
            organizationId: user.organizationId,
            poolId: job.poolId,
            jobId: id,
            technicianId: user.id,
            chemicalType: parsed.chemicalType,
            dosageAmount: parsed.dosageAmount,
            dosageUnit: parsed.dosageUnit,
            costPerUnit: parsed.costPerUnit,
            phReading: parsed.phReading == null || Number.isNaN(parsed.phReading) ? null : parsed.phReading,
            chlorineReading: parsed.chlorineReading == null || Number.isNaN(parsed.chlorineReading) ? null : parsed.chlorineReading,
            alkalinityReading: parsed.alkalinityReading == null || Number.isNaN(parsed.alkalinityReading) ? null : parsed.alkalinityReading,
            notes: parsed.notes || null,
          },
        });
        await generateAlertsForChemicalLog(tx, chemicalLog.id);
      }

      for (const entry of incidentEntries) {
        const parsed = incidentSchema.parse(entry);
        await tx.incidentLog.create({
          data: {
            organizationId: user.organizationId,
            poolId: job.poolId,
            jobId: id,
            technicianId: user.id,
            title: parsed.title,
            details: parsed.details,
            severity: parsed.severity,
          },
        });
      }

      await tx.job.update({
        where: { id },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to complete job", 500);
  }
}
