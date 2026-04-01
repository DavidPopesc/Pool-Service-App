import { db } from "@/lib/db";
import { canManageJobs } from "@/lib/permissions";
import { requireApiUser, fail, ok } from "@/lib/api";
import { jobSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (!canManageJobs(user.role)) return fail("Forbidden", 403);

    const parsed = jobSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const pool = await db.pool.findUnique({ where: { id: parsed.data.poolId } });
    if (!pool || pool.organizationId !== user.organizationId) return fail("Pool not found", 404);

    const job = await db.job.create({
      data: {
        organizationId: user.organizationId,
        poolId: parsed.data.poolId,
        technicianId: parsed.data.technicianId || null,
        createdById: user.id,
        title: parsed.data.title,
        scheduledStart: new Date(parsed.data.scheduledStart),
        scheduledEnd: new Date(parsed.data.scheduledEnd),
        routeOrder: parsed.data.routeOrder ?? null,
        notes: parsed.data.notes || null,
      },
    });

    if (parsed.data.checklistTemplateId) {
      const template = await db.checklistTemplate.findUnique({
        where: { id: parsed.data.checklistTemplateId },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });

      if (template) {
        await db.jobChecklistItem.createMany({
          data: template.items.map((item) => ({
            jobId: job.id,
            templateItemId: item.id,
            label: item.label,
            sortOrder: item.sortOrder,
            required: item.required,
          })),
        });
      }
    }

    return ok({ id: job.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create job", 500);
  }
}
