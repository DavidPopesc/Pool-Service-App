"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { customerSchema } from "@/lib/validation";
import { Button } from "@/components/ui";
import { useSubmit } from "@/components/forms/use-submit";

type FormValues = z.infer<typeof customerSchema>;

export function CustomerForm({
  customer,
  mode,
}: {
  customer?: { id: string } & Partial<FormValues>;
  mode: "create" | "edit";
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      address: customer?.address ?? "",
      notes: customer?.notes ?? "",
    },
  });
  const { submit, isPending, error, success } = useSubmit();

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        const result = await submit(mode === "create" ? "/api/customers" : `/api/customers/${customer!.id}`, values, {
          method: mode === "create" ? "POST" : "PUT",
          successPath: mode === "create" ? "/customers" : undefined,
        });

        if (mode === "edit" && !result?.error) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message}><input {...register("name")} /></Field>
        <Field label="Email" error={errors.email?.message}><input {...register("email")} /></Field>
        <Field label="Phone"><input {...register("phone")} /></Field>
        <Field label="Address" error={errors.address?.message}><input {...register("address")} /></Field>
      </div>
      <Field label="Notes"><textarea {...register("notes")} /></Field>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success && mode === "edit" ? <p className="text-sm text-emerald-600">{success}</p> : null}
      <Button type="submit">{isPending ? "Saving..." : mode === "create" ? "Create customer" : "Save changes"}</Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
