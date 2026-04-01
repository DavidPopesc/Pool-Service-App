"use client";

import { PoolStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { poolSchema } from "@/lib/validation";
import { Button } from "@/components/ui";
import { useSubmit } from "@/components/forms/use-submit";

type FormValues = z.infer<typeof poolSchema>;

export function PoolForm({
  customers,
  pool,
  mode,
}: {
  customers: { id: string; name: string }[];
  pool?: { id: string } & Partial<FormValues>;
  mode: "create" | "edit";
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(poolSchema),
    defaultValues: {
      customerId: pool?.customerId ?? customers[0]?.id ?? "",
      name: pool?.name ?? "",
      poolType: pool?.poolType ?? "",
      dimensions: pool?.dimensions ?? "",
      estimatedVolume: pool?.estimatedVolume ?? 20000,
      careInstructions: pool?.careInstructions ?? "",
      targetPhMin: pool?.targetPhMin ?? 7.2,
      targetPhMax: pool?.targetPhMax ?? 7.6,
      targetChlorineMin: pool?.targetChlorineMin ?? 1,
      targetChlorineMax: pool?.targetChlorineMax ?? 3,
      notes: pool?.notes ?? "",
      status: pool?.status ?? PoolStatus.ACTIVE,
    },
  });
  const { submit, isPending, error, success } = useSubmit();

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await submit(mode === "create" ? "/api/pools" : `/api/pools/${pool!.id}`, values, {
          method: mode === "create" ? "POST" : "PUT",
          successPath: mode === "create" ? "/pools" : undefined,
        });
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Customer" error={errors.customerId?.message}>
          <select {...register("customerId")}>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Pool name" error={errors.name?.message}><input {...register("name")} /></Field>
        <Field label="Pool type" error={errors.poolType?.message}><input {...register("poolType")} /></Field>
        <Field label="Dimensions" error={errors.dimensions?.message}><input {...register("dimensions")} /></Field>
        <Field label="Estimated volume (gal)" error={errors.estimatedVolume?.message}><input type="number" {...register("estimatedVolume")} /></Field>
        <Field label="Status">
          <select {...register("status")}>
            {Object.values(PoolStatus).map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </Field>
        <Field label="Target pH min" error={errors.targetPhMin?.message}><input type="number" step="0.1" {...register("targetPhMin")} /></Field>
        <Field label="Target pH max" error={errors.targetPhMax?.message}><input type="number" step="0.1" {...register("targetPhMax")} /></Field>
        <Field label="Target chlorine min"><input type="number" step="0.1" {...register("targetChlorineMin")} /></Field>
        <Field label="Target chlorine max"><input type="number" step="0.1" {...register("targetChlorineMax")} /></Field>
      </div>
      <Field label="Care instructions" error={errors.careInstructions?.message}><textarea {...register("careInstructions")} /></Field>
      <Field label="Notes"><textarea {...register("notes")} /></Field>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success && mode === "edit" ? <p className="text-sm text-emerald-600">{success}</p> : null}
      <Button type="submit">{isPending ? "Saving..." : mode === "create" ? "Create pool" : "Save changes"}</Button>
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
