import { PoolStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { canManagePools } from "@/lib/permissions";
import { requireApiUser, fail, ok } from "@/lib/api";
import { poolSchema } from "@/lib/validation";

function normalizeOptionalNumber(value: number | undefined) {
  return value == null || Number.isNaN(value) ? null : value;
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (!canManagePools(user.role)) return fail("Forbidden", 403);

    const parsed = poolSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const customer = await db.customer.findUnique({ where: { id: parsed.data.customerId } });
    if (!customer || customer.organizationId !== user.organizationId) return fail("Customer not found", 404);

    const pool = await db.pool.create({
      data: {
        organizationId: user.organizationId,
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
        status: parsed.data.status ?? PoolStatus.ACTIVE,
      },
    });

    return ok({ id: pool.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create pool", 500);
  }
}
