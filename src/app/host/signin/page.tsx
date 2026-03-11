"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shell } from "@/components/shell";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIInput } from "@/components/ui-input";

export default function HostSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setLoading(false);
      setError("ელფოსტა ან პაროლი არასწორია");
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    const sessionData = await sessionResponse.json().catch(() => ({}));

    setLoading(false);

    if (sessionData?.user?.role !== "HOST" && sessionData?.user?.role !== "ADMIN") {
      setError("ეს ანგარიში ჰოსტის პანელისთვის არ არის გააქტიურებული");
      return;
    }

    router.push("/host");
    router.refresh();
  }

  return (
    <Shell>
      <section className="mx-auto mt-10 max-w-md px-4">
        <UICard className="space-y-5 p-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">ჰოსტის პანელი</h1>
          <p className="text-sm leading-6 text-gray-700">შედი იმ ელფოსტით და პაროლით, რომელიც ადმინისტრატორმა გამოგიგზავნა.</p>

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
            <UIInput
              label="პაროლი"
              name="password"
              type="password"
              required
              requiredMark
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            <UIButton fullWidth size="lg" disabled={loading} type="submit">
              {loading ? "მიმდინარეობს..." : "შესვლა"}
            </UIButton>
          </form>

          <p className="text-sm text-gray-700">
            ადმინისტრატორი ხარ? <Link href="/auth/signin" className="text-primary underline">ადმინ შესვლა</Link>
          </p>
        </UICard>
      </section>
    </Shell>
  );
}
