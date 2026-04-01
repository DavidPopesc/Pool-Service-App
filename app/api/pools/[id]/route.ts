import { db } from "@/lib/db";
import { canManagePools } from "@/lib/permissions";
import { requireApiUser, fail, ok } from "@/lib/api";
import { poolSchema } from "@/lib/validation";

function normalizeOptionalNumber(value: number | undefined) {
  return value == null || Number.isNaN(value) ? null : value;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireApiUser();
    if (!canManagePools(user.role)) return fail("Forbidden", 403);

    const parsed = poolSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const pool = await db.pool.findUnique({ where: { id } });
    if (!pool || pool.organizationId !== user.organizationId) return fail("Pool not found", 404);

    await db.pool.update({
      where: { id },
      data: {
        customerId: parsed.data.customerId,
        name: parsed.data.name,
        poolType: parsed.data.poolType,
        dimensions: parsed.data.dimensions,
        estimatedVolume: parsed.data.estimatedVolume,
        careInstructions: parsed.data.careInstructions,
        targetPhMin: parsed.data.targetPhMin,
        targetPhMax: parsed.data.targetPhMax,
        targetChlorineMin: normalizeOptionalNumber(parsed.data.targetChlorineMin),
        targetChlorineMax: normalizeOptionalNumber(parsed.data.targetChlorineMax),
        notes: parsed.data.notes || null,
        status: parsed.data.status,
      },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update pool", 500);
  }
}
