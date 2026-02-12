"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIInput } from "@/components/ui-input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "მოთხოვნა ვერ შესრულდა");
      return;
    }

    setMessage(data?.message ?? "თუ ელფოსტა არსებობს, წერილი გამოგზავნილია.");
  }

  return (
    <section className="mx-auto mt-10 max-w-md px-4">
      <UICard className="space-y-5 p-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">პაროლის აღდგენა</h1>
        <p className="text-sm text-gray-700">შეიყვანე ელფოსტა და გამოგიგზავნით პაროლის შეცვლის ბმულს.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <UIInput
            label="ელფოსტა"
            name="email"
            type="email"
            required
            requiredMark
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p> : null}
          {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <UIButton fullWidth size="lg" disabled={loading}>
            {loading ? "იგზავნება..." : "ბმულის გაგზავნა"}
          </UIButton>
        </form>

        <p className="text-sm text-gray-700">
          უკან შესვლაზე: <Link href="/auth/signin" className="text-primary underline">შესვლა</Link>
        </p>
      </UICard>
    </section>
  );
}
