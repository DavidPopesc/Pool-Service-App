import { db } from "@/lib/db";
import { canManageCustomers } from "@/lib/permissions";
import { requireApiUser, fail, ok } from "@/lib/api";
import { customerSchema } from "@/lib/validation";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireApiUser();
    if (!canManageCustomers(user.role)) return fail("Forbidden", 403);

    const parsed = customerSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer || customer.organizationId !== user.organizationId) return fail("Customer not found", 404);

    await db.customer.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address,
        notes: parsed.data.notes || null,
      },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update customer", 500);
  }
}
