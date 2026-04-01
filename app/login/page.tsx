import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { LoginForm } from "@/components/forms/login-form";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d6f3e6,transparent_35%),linear-gradient(180deg,#f8fafc,#eef2f7)] px-4">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_460px]">
        <div className="hidden rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl lg:block">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-100">Course Demo MVP</p>
          <h1 className="mt-4 text-4xl font-semibold">Pool operations with service history that actually holds up in a demo.</h1>
          <ul className="mt-8 space-y-4 text-sm text-slate-300">
            <li>Role-based dashboards for owner, ops manager, and field technician.</li>
            <li>Customer, pool, job, checklist, service, chemical, alert, and report workflows backed by Prisma.</li>
            <li>Customer update emails send with SMTP when configured or fall back to the database and console.</li>
          </ul>
        </div>
        <Card className="mx-auto w-full max-w-xl p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Pool Cleaners Inc.</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">Use the seeded demo accounts from the README to explore each workflow.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
