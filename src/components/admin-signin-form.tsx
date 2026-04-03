"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIInput } from "@/components/ui-input";

export function AdminSignInForm() {
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

    setLoading(false);

    if (result?.error) {
      setError("ელფოსტა ან პაროლი არასწორია");
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    const sessionData = await sessionResponse.json().catch(() => ({}));
    const role = sessionData?.user?.role;

    if (role === "HOST") {
      router.push("/host");
    } else {
      router.push("/admin");
    }
    router.refresh();
  }

  return (
    <section className="mx-auto mt-10 max-w-md px-4">
      <UICard className="space-y-5 p-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">ადმინ ავტორიზაცია</h1>
        <p className="text-sm leading-6 text-gray-700">შედი ელფოსტით და პაროლით.</p>

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

        <div className="space-y-1 text-sm text-gray-700">
          <p>
            ანგარიში არ გაქვს? <Link href="/auth/signup" className="text-primary underline">რეგისტრაცია</Link>
          </p>
          <p>
            პაროლი დაგავიწყდა? <Link href="/auth/forgot-password" className="text-primary underline">აღდგენა</Link>
          </p>
        </div>
      </UICard>
    </section>
  );
}
