"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
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
  const [isEnglish, setIsEnglish] = useState(false);

  function withLang(href: string) {
    return isEnglish ? `${href}?lang=en` : href;
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsEnglish(new URLSearchParams(window.location.search).get("lang") === "en");
    }
  }, []);

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
      setError(isEnglish ? "Invalid email or password" : "ელფოსტა ან პაროლი არასწორია");
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    const sessionData = await sessionResponse.json().catch(() => ({}));
    const role = sessionData?.user?.role;

    if (role === "HOST") {
      router.push(withLang("/host"));
    } else {
      router.push(withLang("/admin"));
    }
    router.refresh();
  }

  return (
    <section className="mx-auto mt-10 max-w-md px-4">
      <UICard className="space-y-5 p-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{isEnglish ? "Admin Sign In" : "ადმინ ავტორიზაცია"}</h1>
        <p className="text-sm leading-6 text-gray-700">{isEnglish ? "Sign in with your email and password." : "შედი ელფოსტით და პაროლით."}</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <UIInput
            label={isEnglish ? "Email" : "ელფოსტა"}
            name="email"
            type="email"
            required
            requiredMark
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <UIInput
            label={isEnglish ? "Password" : "პაროლი"}
            name="password"
            type="password"
            required
            requiredMark
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <UIButton fullWidth size="lg" disabled={loading} type="submit">
            {loading ? (isEnglish ? "Loading..." : "მიმდინარეობს...") : (isEnglish ? "Sign In" : "შესვლა")}
          </UIButton>
        </form>

        <div className="space-y-1 text-sm text-gray-700">
          <p>
            {isEnglish ? "No account?" : "ანგარიში არ გაქვს?"} <Link href={withLang("/auth/signup")} className="text-primary underline">{isEnglish ? "Sign up" : "რეგისტრაცია"}</Link>
          </p>
          <p>
            {isEnglish ? "Forgot password?" : "პაროლი დაგავიწყდა?"} <Link href={withLang("/auth/forgot-password")} className="text-primary underline">{isEnglish ? "Recover" : "აღდგენა"}</Link>
          </p>
        </div>
      </UICard>
    </section>
  );
}
