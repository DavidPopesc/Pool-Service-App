import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Button, Card, PageHeader, StatusBadge } from "@/components/ui";

export default async function CustomersPage() {
  const user = await requireRole(["OWNER"]);
  const customers = await db.customer.findMany({
    where: { organizationId: user.organizationId },
    include: { pools: true, messages: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage residential, community, and resort accounts." action={<Button href="/customers/new">New customer</Button>} />
      <Card className="overflow-hidden p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Pools</th>
              <th className="px-4 py-3">Updates</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-slate-200">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{customer.name}</p>
                  <p className="text-slate-500">{customer.address}</p>
                </td>
                <td className="px-4 py-3">{customer.email || customer.phone || "No contact info"}</td>
                <td className="px-4 py-3">{customer.pools.length}</td>
                <td className="px-4 py-3"><StatusBadge label={`${customer.messages.length} sent`} tone="info" /></td>
                <td className="px-4 py-3 text-right"><a href={`/customers/${customer.id}`} className="font-medium">View</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
