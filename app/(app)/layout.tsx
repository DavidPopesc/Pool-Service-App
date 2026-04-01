import { headers } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const headerStore = await headers();
  const pathname = headerStore.get("x-current-path") ?? "/dashboard";

  return <AppShell user={user} pathname={pathname}>{children}</AppShell>;
}
