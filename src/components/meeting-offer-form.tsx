"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIInput } from "@/components/ui-input";

type Props = { recipientAttendeeId: string; conferenceId: string };

export function MeetingOfferForm({ recipientAttendeeId, conferenceId }: Props) {
  const initialProposedAt = useMemo(() => {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }, []);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proposedAt, setProposedAt] = useState(initialProposedAt);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/meeting-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientAttendeeId,
          proposedAt: String(formData.get("proposedAt") || ""),
          note: String(formData.get("note") || "")
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          setNeedsRegistration(true);
        }
        setError(data?.error ?? "შეთავაზება ვერ გაიგზავნა");
        return;
      }

      setMessage("შეხვედრის შეთავაზება წარმატებით გაიგზავნა.");
      form.reset();
      setProposedAt(initialProposedAt);
    } catch {
      setError("შეთავაზება ვერ გაიგზავნა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <UICard className="space-y-3">
      <h3 className="text-base font-semibold text-primary">შეხვედრის შეთავაზება</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <UIInput
          label="შემოთავაზებული დრო"
          name="proposedAt"
          type="datetime-local"
          value={proposedAt}
          onChange={(event) => setProposedAt(event.target.value)}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">შეხვედრის მიზანი</span>
          <textarea
            name="note"
            rows={3}
            placeholder="დაწერე მოკლე ტექსტი შეხვედრის მიზანზე"
            maxLength={500}
            className="w-full resize-none"
          />
        </label>
        <UIButton type="submit" disabled={loading} fullWidth className="w-full max-w-full overflow-hidden text-ellipsis">
          {loading ? "იგზავნება..." : "შეთავაზების გაგზავნა"}
        </UIButton>
      </form>
      {needsRegistration ? (
        <div className="space-y-3 rounded-xl border border-[#dbe7ff] bg-[#f7fbff] p-4">
          <p className="text-sm leading-6 text-gray-700">
            შეხვედრის შეთავაზების გასაგზავნად ჯერ უნდა დარეგისტრირდე ამ ღონისძიებაზე.
          </p>
          <Link
            href={`/register?conferenceId=${conferenceId}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            რეგისტრაცია
          </Link>
        </div>
      ) : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}
    </UICard>
  );
}
