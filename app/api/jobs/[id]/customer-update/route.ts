import { db } from "@/lib/db";
import { canSendCustomerUpdates } from "@/lib/permissions";
import { sendOrQueueCustomerEmail } from "@/lib/email";
import { requireApiUser, fail, ok } from "@/lib/api";
import { customerUpdateSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireApiUser();
    if (!canSendCustomerUpdates(user.role)) return fail("Forbidden", 403);

    const parsed = customerUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const job = await db.job.findUnique({
      where: { id },
      include: { pool: { include: { customer: true } }, technician: true, serviceLog: true, chemicalLogs: true },
    });
    if (!job || job.organizationId !== user.organizationId) return fail("Job not found", 404);

    const record = await sendOrQueueCustomerEmail({
      organizationId: user.organizationId,
      customerId: job.pool.customer.id,
      jobId: id,
      createdById: user.id,
      to: job.pool.customer.email,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });

    return ok({ id: record.id, status: record.status });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to send update", 500);
  }
}
