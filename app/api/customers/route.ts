import { db } from "@/lib/db";
import { canManageCustomers } from "@/lib/permissions";
import { requireApiUser, fail, ok } from "@/lib/api";
import { customerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (!canManageCustomers(user.role)) return fail("Forbidden", 403);

    const parsed = customerSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const customer = await db.customer.create({
      data: {
        organizationId: user.organizationId,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address,
        notes: parsed.data.notes || null,
      },
    });

    return ok({ id: customer.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create customer", 500);
  }
}
