"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <section className="mx-auto mt-20 max-w-md space-y-5 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-brand-900">ადმინ ავტორიზაცია</h1>
      <p className="text-sm text-brand-700">გთხოვ, შეხვიდე Google ანგარიშით, რომელსაც ადმინისტრატორის წვდომა აქვს.</p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/admin" })}
        className="w-full rounded-xl bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
      >
        Google-ით შესვლა
      </button>
    </section>
  );
}
