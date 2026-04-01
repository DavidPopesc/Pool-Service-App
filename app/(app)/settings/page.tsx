import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Local MVP environment settings and account info." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Your account</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-700">
            <div><dt className="font-medium text-slate-900">Name</dt><dd>{user.name}</dd></div>
            <div><dt className="font-medium text-slate-900">Email</dt><dd>{user.email}</dd></div>
            <div><dt className="font-medium text-slate-900">Role</dt><dd>{user.role}</dd></div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Email delivery</h2>
          <p className="mt-4 text-sm text-slate-600">If SMTP environment variables are configured, customer updates send by email. Without SMTP, messages are saved in the database and logged to the console for demo reliability.</p>
        </Card>
      </div>
    </div>
  );
}
