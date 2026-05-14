"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIInput } from "@/components/ui-input";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const hasToken = useMemo(() => token.length > 0 && email.length > 0, [token, email]);
  const isEnglish = searchParams.get("lang") === "en";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasToken) {
      setError(isEnglish ? "Invalid link" : "ბმული არასწორია");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password })
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? (isEnglish ? "Password reset failed" : "პაროლის შეცვლა ვერ შესრულდა"));
      return;
    }

    setSuccess(isEnglish ? "Password changed successfully. Redirecting..." : "პაროლი წარმატებით შეიცვალა. გადამისამართება...");
    setTimeout(() => {
      router.push(isEnglish ? "/auth/signin?lang=en" : "/auth/signin");
      router.refresh();
    }, 1200);
  }

  return (
    <section className="mx-auto mt-10 max-w-md px-4">
      <UICard className="space-y-5 p-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{isEnglish ? "New Password" : "ახალი პაროლი"}</h1>
        <p className="text-sm text-gray-700">{isEnglish ? "Enter your new password." : "შეიყვანე ახალი პაროლი."}</p>

        {!hasToken ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{isEnglish ? "The link is invalid or incomplete." : "ბმული არასწორია ან არასრულია."}</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <UIInput
              label={isEnglish ? "Password" : "პაროლი"}
              name="password"
              type="password"
              required
              requiredMark
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p> : null}
            {success ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

            <UIButton fullWidth size="lg" disabled={loading}>
              {loading ? (isEnglish ? "Saving..." : "ინახება...") : (isEnglish ? "Change Password" : "პაროლის შეცვლა")}
            </UIButton>
          </form>
        )}

        <p className="text-sm text-gray-700">
          <Link href={isEnglish ? "/auth/signin?lang=en" : "/auth/signin"} className="text-primary underline">{isEnglish ? "Sign in" : "შესვლა"}</Link>
        </p>
      </UICard>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<section className="mx-auto mt-10 max-w-md px-4" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
