"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/lib/validation";
import { useSubmit } from "@/components/forms/use-submit";

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { submit, isPending, error } = useSubmit();

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await submit("/api/auth/login", values, { successPath: "/dashboard" });
      })}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input type="password" {...register("password")} />
        {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button disabled={isPending} type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
