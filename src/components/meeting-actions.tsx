"use client";

import { useMemo, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";

type Props = {
  attendeeId: string;
};

export function MeetingActions({ attendeeId }: Props) {
  const defaultStart = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  }, []);

  const [title, setTitle] = useState("ქსელური შეხვედრა");
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function createGoogleEvent() {
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/calendar/propose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendeeId, title, startsAt, durationMinutes, notes })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data?.error ?? "კალენდარში დამატება ვერ მოხერხდა");
      return;
    }

    setMessage("შეხვედრა დაემატა კალენდარში");
    if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
  }

  const icsUrl = `/api/ics/${attendeeId}?title=${encodeURIComponent(title)}&startsAt=${encodeURIComponent(startsAt)}&durationMinutes=${durationMinutes}&notes=${encodeURIComponent(notes)}`;

  return (
    <UICard className="space-y-3">
      <h3 className="text-lg font-semibold text-primary">შეხვედრის შეთავაზება</h3>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="სათაური" />
      <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
      <input type="number" min={15} max={180} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="შენიშვნა" />

      <div className="grid grid-cols-1 gap-2">
        <UIButton onClick={createGoogleEvent} disabled={loading}>{loading ? "იგზავნება..." : "კალენდარში დამატება"}</UIButton>
        <a href={icsUrl} className="rounded-md border border-primary px-4 py-3 text-center text-sm font-medium text-primary">
          ICS ჩამოტვირთვა
        </a>
      </div>

      {message ? <p className="text-sm text-gray-700">{message}</p> : null}
    </UICard>
  );
}
