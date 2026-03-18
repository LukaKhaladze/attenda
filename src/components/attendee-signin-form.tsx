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
};

export function AttendeeSignInForm({ conferenceId, conferenceTitle }: Props) {
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
        setError(data?.error ?? "შესვლა ვერ შესრულდა");
        return;
      }

      router.push(`/attendees?conferenceId=${conferenceId}`);
      router.refresh();
    } catch {
      setError("შესვლა ვერ შესრულდა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <UIHeader title="დამსწრის შესვლა" backHref="/" />
      <UICard className="space-y-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{conferenceTitle}</h1>
          <p className="text-sm leading-6 text-gray-700">
            თუ ამ ღონისძიებაზე უკვე დარეგისტრირდი, შეიყვანე შენი სახელი და პოზიცია, რომ შეხვიდე დამსწრეთა სიაში.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <UIInput
            label="სახელი"
            required
            requiredMark
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <UIInput
            label="პოზიცია"
            required
            requiredMark
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          />

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <UIButton type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "იტვირთება..." : "შესვლა"}
          </UIButton>
        </form>
      </UICard>
    </section>
  );
}
