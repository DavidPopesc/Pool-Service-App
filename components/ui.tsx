import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-sky-700/80">Pool Operations</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950 md:text-[2.2rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-glass pool-grid rounded-[1.35rem] border p-5 shadow-[0_16px_36px_rgba(15,27,53,0.06)]",
        className,
      )}
      style={{ borderColor: "var(--card-border)" }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display mb-4 text-xl font-bold tracking-tight text-slate-950">{children}</h2>;
}

export function Button({
  children,
  className,
  variant = "primary",
  href,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  href?: string;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-[linear-gradient(135deg,#f38d2c,#ea7e22)] text-slate-950 hover:brightness-105",
    secondary: "bg-[linear-gradient(135deg,#17234f,#21448a)] text-white hover:brightness-105",
    ghost: "bg-white/70 text-slate-700 hover:bg-white",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  const classes = cn(
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_10px_24px_rgba(15,27,53,0.07)]",
    styles[variant],
    className,
  );

  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button type={type} className={classes}>{children}</button>;
}

export function StatusBadge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "warning" | "danger" | "info" }) {
  const classes = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
  };

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]", classes[tone])}>{label}</span>;
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="font-display text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      {detail ? <div className="text-sm text-slate-500">{detail}</div> : null}
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="text-center">
      <p className="font-display text-lg font-bold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </Card>
  );
}
