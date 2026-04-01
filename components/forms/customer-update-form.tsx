"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { customerUpdateSchema } from "@/lib/validation";
import { useSubmit } from "@/components/forms/use-submit";

type FormValues = z.infer<typeof customerUpdateSchema>;

export function CustomerUpdateForm({
  jobId,
  defaultSubject,
  defaultBody,
}: {
  jobId: string;
  defaultSubject: string;
  defaultBody: string;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(customerUpdateSchema),
    defaultValues: {
      subject: defaultSubject,
      body: defaultBody,
    },
  });
  const { submit, isPending, error, success } = useSubmit();

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        await submit(`/api/jobs/${jobId}/customer-update`, values);
      })}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
        <input {...register("subject")} />
        {errors.subject ? <p className="mt-1 text-xs text-rose-600">{errors.subject.message}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
        <textarea {...register("body")} />
        {errors.body ? <p className="mt-1 text-xs text-rose-600">{errors.body.message}</p> : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">Customer update queued or sent.</p> : null}
      <button type="submit" disabled={isPending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
        {isPending ? "Sending..." : "Send customer update"}
      </button>
    </form>
  );
}
