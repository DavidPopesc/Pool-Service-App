import { CustomerForm } from "@/components/forms/customer-form";
import { Card, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export default async function NewCustomerPage() {
  await requireRole(["OWNER"]);

  return (
    <div>
      <PageHeader title="New customer" description="Add a customer account and contact record." />
      <Card><CustomerForm mode="create" /></Card>
    </div>
  );
}
