"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { checklistTemplateSchema } from "@/lib/validation";
import { Button } from "@/components/ui";
import { useSubmit } from "@/components/forms/use-submit";

type FormValues = z.infer<typeof checklistTemplateSchema>;

export function ChecklistTemplateForm() {
  const [itemLabel, setItemLabel] = useState("");
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(checklistTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      items: [{ label: "Inspect pump basket", required: true }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const { submit, isPending, error } = useSubmit();

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await submit("/api/checklists", values, {
          successPath: "/checklists",
          onSuccess: () => reset(),
        });
      })}
    >
      <Field label="Template name" error={errors.name?.message}><input {...register("name")} /></Field>
      <Field label="Description"><textarea {...register("description")} /></Field>
      <div className="rounded-xl border border-slate-200 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Checklist items</p>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`items.${index}.label`)} />
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm">
                <input type="checkbox" {...register(`items.${index}.required`)} />
                Required
              </label>
              <button type="button" className="rounded-lg bg-slate-100 px-3 text-sm" onClick={() => remove(index)}>Remove</button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={itemLabel} onChange={(event) => setItemLabel(event.target.value)} placeholder="Add another checklist item" />
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 text-sm text-white"
              onClick={() => {
                if (!itemLabel.trim()) return;
                append({ label: itemLabel.trim(), required: true });
                setItemLabel("");
              }}
            >
              Add item
            </button>
          </div>
          {errors.items ? <p className="text-xs text-rose-600">{errors.items.message as string}</p> : null}
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit">{isPending ? "Saving..." : "Create checklist template"}</Button>
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
