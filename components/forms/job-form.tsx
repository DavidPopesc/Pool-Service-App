"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { jobSchema } from "@/lib/validation";
import { Button } from "@/components/ui";
import { useSubmit } from "@/components/forms/use-submit";

type FormValues = z.infer<typeof jobSchema>;

export function JobForm({
  pools,
  technicians,
  checklistTemplates,
}: {
  pools: { id: string; name: string; customerName: string }[];
  technicians: { id: string; name: string }[];
  checklistTemplates: { id: string; name: string }[];
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      poolId: pools[0]?.id ?? "",
      technicianId: technicians[0]?.id ?? "",
      title: "Routine service visit",
      scheduledStart: "",
      scheduledEnd: "",
      routeOrder: 1,
      notes: "",
      checklistTemplateId: checklistTemplates[0]?.id ?? "",
    },
  });
  const { submit, isPending, error } = useSubmit();

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await submit("/api/jobs", values, { successPath: "/jobs" });
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pool" error={errors.poolId?.message}>
          <select {...register("poolId")}>
            {pools.map((pool) => <option key={pool.id} value={pool.id}>{pool.name} - {pool.customerName}</option>)}
          </select>
        </Field>
        <Field label="Technician">
          <select {...register("technicianId")}>
            {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
          </select>
        </Field>
        <Field label="Title" error={errors.title?.message}><input {...register("title")} /></Field>
        <Field label="Route order"><input type="number" {...register("routeOrder")} /></Field>
        <Field label="Scheduled start" error={errors.scheduledStart?.message}><input type="datetime-local" {...register("scheduledStart")} /></Field>
        <Field label="Scheduled end" error={errors.scheduledEnd?.message}><input type="datetime-local" {...register("scheduledEnd")} /></Field>
        <Field label="Checklist template">
          <select {...register("checklistTemplateId")}>
            <option value="">No template</option>
            {checklistTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Notes"><textarea {...register("notes")} /></Field>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit">{isPending ? "Creating..." : "Create job"}</Button>
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
