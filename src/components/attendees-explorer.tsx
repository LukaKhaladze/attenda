"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { UICard } from "@/components/ui-card";
import { UIAvatar } from "@/components/ui-avatar";

type Attendee = {
  id: string;
  fullName: string;
  company: string | null;
  position: string | null;
  photoUrl: string | null;
};

type Props = {
  conferenceId?: string;
};

const positionPresets = ["ყველა", "დამფუძნებელი", "CEO", "CTO", "დიზაინერი", "ვებ დეველოპერი", "პროდუქტის მენეჯერი"];

export function AttendeesExplorer({ conferenceId }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [position, setPosition] = useState("ყველა");

  const effectivePosition = useMemo(() => (position === "ყველა" ? "" : position), [position]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 220);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ q: debouncedQ });
      if (conferenceId) params.set("conferenceId", conferenceId);
      if (effectivePosition) params.set("position", effectivePosition);
      const response = await fetch(`/api/attendees?${params.toString()}`, { signal: controller.signal });
      const data = await response.json();
      setAttendees(data.items ?? []);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedQ, effectivePosition, conferenceId]);

  return (
    <section className="space-y-2">
      <UICard className="space-y-2 p-3 sm:p-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input className="h-10 w-full rounded-md pl-9 text-sm" placeholder="მოძებნე ადამიანის სახელი ან პოზიცია" value={q} onChange={(event) => setQ(event.target.value)} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {positionPresets.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPosition(item)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${position === item ? "bg-primary text-white" : "border border-gray-300 text-gray-700"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </UICard>

      {loading ? <p className="text-sm text-gray-600">იტვირთება...</p> : null}

      {!loading && attendees.length === 0 ? (
        <UICard>
          <p className="text-sm text-gray-600">მონაცემი ვერ მოიძებნა. სცადე სხვა ფილტრი.</p>
        </UICard>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {attendees.map((attendee) => (
          <Link key={attendee.id} href={`/attendees/${attendee.id}`}>
            <UICard className="flex items-center gap-3 active:scale-[0.98]">
              <UIAvatar src={attendee.photoUrl} alt={attendee.fullName} size="md" />
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-gray-900">{attendee.fullName}</h3>
                <p className="truncate text-sm text-gray-700">{attendee.position || "პოზიცია არ არის მითითებული"}</p>
                <p className="truncate text-sm text-gray-600">{attendee.company || "კომპანია არ არის მითითებული"}</p>
              </div>
            </UICard>
          </Link>
        ))}
      </div>
    </section>
  );
}
