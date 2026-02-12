"use client";

import { useMemo, useState } from "react";

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        attendeeId,
        title,
        startsAt,
        durationMinutes,
        notes
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data?.error ?? "Google Calendar-ში დამატება ვერ მოხერხდა");
      return;
    }

    setMessage("შეხვედრა დაემატა Google Calendar-ში");
    if (data?.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
  }

  const icsUrl = `/api/ics/${attendeeId}?title=${encodeURIComponent(title)}&startsAt=${encodeURIComponent(startsAt)}&durationMinutes=${durationMinutes}&notes=${encodeURIComponent(notes)}`;

  return (
    <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4">
      <h3 className="text-lg font-semibold text-brand-900">შეხვედრის შეთავაზება</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm">სათაური</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">დაწყების დრო</label>
          <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">ხანგრძლივობა (წუთი)</label>
          <input
            type="number"
            min={15}
            max={180}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm">შენიშვნა</label>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={createGoogleEvent}
          disabled={loading}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "იგზავნება..." : "Google Calendar-ით შექმნა"}
        </button>
        <a href={icsUrl} className="rounded-xl bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-200">
          ICS ჩამოტვირთვა
        </a>
      </div>

      {message ? <p className="text-sm text-brand-700">{message}</p> : null}
    </div>
  );
}
