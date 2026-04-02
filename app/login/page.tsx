import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { LoginForm } from "@/components/forms/login-form";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="app-wave-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_460px]">
        <div className="ocean-panel hidden overflow-hidden rounded-[2rem] p-10 text-white shadow-[0_28px_70px_rgba(12,18,52,0.24)] lg:block">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200/80">Field Service Command</p>
          <h1 className="font-display mt-5 max-w-xl text-5xl font-bold leading-[0.95] tracking-tight">
            Pool service software with a cleaner route, calmer crew, and sharper records.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-200/90">
            A cleaner, more disciplined operating system for pool companies handling service routes, chemistry, customer updates, and reporting.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/7 p-5">
              <p className="text-[0.72rem] uppercase tracking-[0.26em] text-sky-200/80">Disciplined Operations</p>
              <p className="mt-3 font-display text-2xl font-bold">Routes, chemistry, and customer updates in one lane.</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/7 p-5">
              <p className="text-[0.72rem] uppercase tracking-[0.26em] text-orange-200/90">Field Ready</p>
              <p className="mt-3 font-display text-2xl font-bold">Owner, operations, and technician workflows aligned in one view.</p>
            </div>
          </div>
          <div className="wave-lines mt-10 h-12 rounded-xl opacity-60" />
          <ul className="mt-8 grid gap-4 text-sm text-slate-200/90">
            <li>Role-based dashboards for owner, ops manager, and field technician.</li>
            <li>Job execution, alerts, reporting, and customer communication flows in one system.</li>
            <li>Hosted PostgreSQL-backed data so the app feels like a real operating product, not a mockup.</li>
          </ul>
        </div>
        <Card className="mx-auto w-full max-w-xl rounded-[1.6rem] p-8 md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#17234f,#21448a)] text-lg font-bold text-white shadow-[0_14px_28px_rgba(15,18,63,0.18)]">
              P
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-700">Pool Cleaners Inc.</p>
              <p className="text-sm text-slate-500">Bluewater Route Desk</p>
            </div>
          </div>
          <h2 className="font-display mt-6 text-4xl font-bold tracking-tight text-slate-950">Sign in</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use the seeded demo accounts to explore owner, operations, and technician workflows.</p>
          <div className="mt-6 rounded-[1rem] bg-[linear-gradient(135deg,rgba(15,18,63,0.04),rgba(121,216,236,0.14))] p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Quick demo tip</p>
            <p className="mt-1">Start with the owner account for the full view, then switch to a technician to see the field workflow.</p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
