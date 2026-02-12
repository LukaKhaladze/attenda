"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "რეგისტრაცია ვერ შესრულდა");
      return;
    }

    router.push("/auth/signin");
  }

  return (
    <section className="mx-auto mt-20 max-w-md space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">ადმინ რეგისტრაცია</h1>
      <p className="text-sm text-gray-700">შექმენი ადმინისტრატორის ანგარიში ელფოსტით და პაროლით.</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">სახელი</label>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">ელფოსტა</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">პაროლი</label>
          <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-3 font-medium text-white hover:bg-[#1e40af] disabled:opacity-60"
        >
          {loading ? "მიმდინარეობს..." : "რეგისტრაცია"}
        </button>
      </form>

      <p className="text-sm text-gray-700">
        უკვე გაქვს ანგარიში? <Link href="/auth/signin" className="text-primary underline">შესვლა</Link>
      </p>
    </section>
  );
}
