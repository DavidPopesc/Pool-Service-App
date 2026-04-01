import { JobStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { canViewOps } from "@/lib/permissions";
import { requireApiUser, fail, ok } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireApiUser();
    if (!canViewOps(user.role)) return fail("Forbidden", 403);

    const { status } = await request.json();
    if (!Object.values(JobStatus).includes(status)) return fail("Invalid status");

    const job = await db.job.findUnique({ where: { id } });
    if (!job || job.organizationId !== user.organizationId) return fail("Job not found", 404);

    await db.job.update({
      where: { id },
      data: {
        status,
        completedAt: status === JobStatus.COMPLETED ? new Date() : null,
      },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update status", 500);
  }
}
