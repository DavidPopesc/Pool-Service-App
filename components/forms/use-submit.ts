"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Options = {
  method?: "POST" | "PUT";
  successPath?: string;
  onSuccess?: () => void;
};

export function useSubmit() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(url: string, payload: unknown, options: Options = {}) {
    setError(null);
    setSuccess(null);
    const response = await fetch(url, {
      method: options.method ?? "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Request failed");
      return data;
    }
    setSuccess("Saved successfully.");
    if (options.successPath) {
      startTransition(() => {
        router.push(options.successPath!);
        router.refresh();
      });
    } else {
      options.onSuccess?.();
      router.refresh();
    }
    return data;
  }

  return { submit, isPending, error, success };
}
