"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
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

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/6 hover:text-white",
              pathname === item.href && "bg-white text-slate-950 shadow-[0_10px_24px_rgba(10,16,40,0.18)] hover:bg-white",
            )}
          >
            {item.label}
          </Link>
        ))}
    </nav>
  );
}
