"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { UIInput } from "@/components/ui-input";

type Props = {
  conferenceId: string;
  conferenceTitle: string;
  lang?: "ka" | "en";
};

export function AttendeeSignInForm({ conferenceId, conferenceTitle, lang = "ka" }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/attendee/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conferenceId,
          fullName,
          position
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? (lang === "en" ? "Sign in failed" : "შესვლა ვერ შესრულდა"));
        return;
      }

      router.push(`/attendees?conferenceId=${conferenceId}${lang === "en" ? "&lang=en" : ""}`);
      router.refresh();
    } catch {
      setError(lang === "en" ? "Sign in failed" : "შესვლა ვერ შესრულდა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <UIHeader title={lang === "en" ? "Attendee Sign In" : "დამსწრის შესვლა"} backHref="/" />
      <UICard className="space-y-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{conferenceTitle}</h1>
          <p className="text-sm leading-6 text-gray-700">
            {lang === "en"
              ? "If you are already registered for this event, enter your full name and position to continue."
              : "თუ ამ ღონისძიებაზე უკვე დარეგისტრირდი, შეიყვანე შენი სახელი და პოზიცია, რომ შეხვიდე დამსწრეთა სიაში."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <UIInput
            label={lang === "en" ? "Full Name" : "სახელი და გვარი"}
            required
            requiredMark
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <UIInput
            label={lang === "en" ? "Position" : "პოზიცია"}
            required
            requiredMark
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          />

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <UIButton type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? (lang === "en" ? "Loading..." : "იტვირთება...") : (lang === "en" ? "Sign In" : "შესვლა")}
          </UIButton>
        </form>
      </UICard>
    </section>
  );
}
