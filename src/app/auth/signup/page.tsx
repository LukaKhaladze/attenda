"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIInput } from "@/components/ui-input";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "რეგისტრაცია ვერ შესრულდა");
      return;
    }

    router.push("/auth/signin");
  }

  return (
    <section className="mx-auto mt-10 max-w-md px-4">
      <UICard className="space-y-5 p-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">ადმინ რეგისტრაცია</h1>
        <p className="text-sm leading-6 text-gray-700">შექმენი ადმინისტრატორის ანგარიში ელფოსტით და პაროლით.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <UIInput
            label="სახელი"
            name="name"
            required
            requiredMark
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
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
            minLength={8}
            required
            requiredMark
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <UIButton fullWidth size="lg" disabled={loading} type="submit">
            {loading ? "მიმდინარეობს..." : "რეგისტრაცია"}
          </UIButton>
        </form>

        <p className="text-sm text-gray-700">
          უკვე გაქვს ანგარიში? <Link href="/auth/signin" className="text-primary underline">შესვლა</Link>
        </p>
      </UICard>
    </section>
  );
}
