import { db } from "@/lib/db";
import { canViewOps } from "@/lib/permissions";
import { requireApiUser, fail, ok } from "@/lib/api";
import { checklistTemplateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (!canViewOps(user.role)) return fail("Forbidden", 403);

    const parsed = checklistTemplateSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const template = await db.checklistTemplate.create({
      data: {
        organizationId: user.organizationId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        items: {
          create: parsed.data.items.map((item, index) => ({
            label: item.label,
            required: item.required,
            sortOrder: index + 1,
          })),
        },
      },
    });

    return ok({ id: template.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create checklist", 500);
  }
}
