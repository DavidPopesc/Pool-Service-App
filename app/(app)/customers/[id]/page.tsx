import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/forms/customer-form";
import { Card, PageHeader, SectionTitle, StatusBadge } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER"]);
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      pools: true,
      messages: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!customer || customer.organizationId !== user.organizationId) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={customer.name} description={customer.address} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionTitle>Edit customer</SectionTitle>
          <CustomerForm
            mode="edit"
            customer={{
              id: customer.id,
              name: customer.name,
              email: customer.email ?? "",
              phone: customer.phone ?? "",
              address: customer.address,
              notes: customer.notes ?? "",
            }}
          />
        </Card>
        <div className="space-y-6">
          <Card>
            <SectionTitle>Pools</SectionTitle>
            <div className="space-y-3">
              {customer.pools.map((pool) => (
                <div key={pool.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{pool.name}</p>
                  <p className="text-sm text-slate-600">{pool.poolType}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>Customer updates</SectionTitle>
            <div className="space-y-3">
              {customer.messages.map((message) => (
                <div key={message.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{message.subject}</p>
                    <StatusBadge label={message.status} tone={message.status === "SENT" ? "success" : "warning"} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{formatDateTime(message.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
