"use client";

import { FormEvent, useMemo, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";

type Props = { recipientAttendeeId: string };

export function MeetingOfferForm({ recipientAttendeeId }: Props) {
  const defaultStart = useMemo(() => {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  }, []);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/meeting-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientAttendeeId,
        senderName: String(formData.get("senderName") || ""),
        senderContact: String(formData.get("senderContact") || ""),
        proposedAt: String(formData.get("proposedAt") || ""),
        note: String(formData.get("note") || "")
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "შეთავაზება ვერ გაიგზავნა");
      return;
    }

    setMessage("შეხვედრის შეთავაზება გაგზავნილია.");
    event.currentTarget.reset();
  }

  return (
    <UICard className="space-y-3">
      <h3 className="text-base font-semibold text-primary">შეხვედრის შეთავაზება</h3>
      <form onSubmit={onSubmit} className="space-y-2">
        <input name="senderName" placeholder="შენი სახელი" required />
        <input name="senderContact" placeholder="კონტაქტი (ტელეფონი/ელფოსტა)" />
        <input name="proposedAt" type="datetime-local" defaultValue={defaultStart} />
        <textarea name="note" rows={3} placeholder="შენიშვნა" />
        <UIButton type="submit" disabled={loading} fullWidth>
          {loading ? "იგზავნება..." : "შეთავაზების გაგზავნა"}
        </UIButton>
      </form>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}
    </UICard>
  );
}
