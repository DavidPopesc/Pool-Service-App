import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button, Card, PageHeader, SectionTitle } from "@/components/ui";

export default async function ChecklistsPage() {
  const user = await requireRole(["OWNER", "OPERATIONS_MANAGER"]);
  const templates = await db.checklistTemplate.findMany({
    where: { organizationId: user.organizationId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Checklist templates" description="Reusable service steps for standardizing technician visits." action={<Button href="/checklists/new">New checklist</Button>} />
      <div className="grid gap-4 xl:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <SectionTitle>{template.name}</SectionTitle>
            <p className="text-sm text-slate-600">{template.description || "No description"}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {template.items.map((item) => <li key={item.id}>• {item.label}</li>)}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
