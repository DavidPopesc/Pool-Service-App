import Link from "next/link";
import { Role } from "@prisma/client";
import { destroySession, SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers", roles: ["OWNER"] },
  { href: "/pools", label: "Pools", roles: ["OWNER", "OPERATIONS_MANAGER"] },
  { href: "/schedule", label: "Schedule", roles: ["OWNER", "OPERATIONS_MANAGER"] },
  { href: "/jobs", label: "Jobs", roles: ["OWNER", "OPERATIONS_MANAGER"] },
  { href: "/my-jobs", label: "My Jobs", roles: ["TECHNICIAN"] },
  { href: "/checklists", label: "Checklists", roles: ["OWNER", "OPERATIONS_MANAGER"] },
  { href: "/reports", label: "Reports", roles: ["OWNER", "OPERATIONS_MANAGER"] },
  { href: "/team", label: "Team", roles: ["OWNER"] },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  user,
  pathname,
  children,
}: {
  user: SessionUser;
  pathname: string;
  children: React.ReactNode;
}) {
  async function logoutAction() {
    "use server";
    await destroySession();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pool Service App</p>
            <h1 className="mt-2 text-xl font-semibold">Pool Cleaners Inc.</h1>
            <p className="mt-3 text-sm text-slate-300">{user.name}</p>
            <p className="text-xs uppercase tracking-wide text-brand-100">{user.role.replaceAll("_", " ")}</p>
          </div>
          <nav className="space-y-2">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(user.role))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white",
                    pathname === item.href && "bg-brand-600 text-white hover:bg-brand-600",
                  )}
                >
                  {item.label}
                </Link>
              ))}
          </nav>
          <form action={logoutAction} className="mt-8">
            <button type="submit" className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
              Sign out
            </button>
          </form>
        </aside>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
