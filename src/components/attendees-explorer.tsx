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
  initialItems?: Attendee[];
};

export function AttendeesExplorer({ conferenceId, initialItems = [] }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialItems);
  const [positionTerms, setPositionTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [position, setPosition] = useState("ყველა");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const effectivePosition = useMemo(() => (position === "ყველა" ? "" : position), [position]);

  useEffect(() => {
    const unique = Array.from(
      new Set(
        initialItems
          .map((item) => item.position?.trim())
          .filter((value): value is string => Boolean(value) && value !== "ყველა")
      )
    );
    setPositionTerms(unique);
  }, [initialItems]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 220);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const isDefaultFilter = debouncedQ.trim().length === 0 && effectivePosition.length === 0;
    if (isDefaultFilter && initialItems.length > 0) {
      setAttendees(initialItems);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ q: debouncedQ });
      if (conferenceId) params.set("conferenceId", conferenceId);
      if (effectivePosition) params.set("position", effectivePosition);
      const response = await fetch(`/api/attendees?${params.toString()}`, { signal: controller.signal });
      if (!response.ok) {
        setAttendees([]);
        setLoading(false);
        return;
      }
      const data = await response.json().catch(() => ({}));
      setAttendees(data.items ?? []);
      const terms: string[] = Array.isArray(data.positions)
        ? Array.from(
            new Set(
              data.positions.filter(
                (value: unknown): value is string =>
                  typeof value === "string" && value.trim().length > 0 && value !== "ყველა"
              )
            )
          )
        : [];
      setPositionTerms(terms);
      if (position !== "ყველა" && !terms.includes(position)) {
        setPosition("ყველა");
      }
      setLoading(false);
    }
    load().catch(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [debouncedQ, effectivePosition, conferenceId, initialItems]);

  return (
    <section className="space-y-4">
      <UICard className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="h-11 w-full rounded-xl pl-11 text-sm"
            placeholder="მოძებნე ადამიანი ან კომპანია"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          </div>
          <button
            type="button"
            aria-label="ფილტრი"
            onClick={() => setFiltersOpen((value) => !value)}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-primary transition-colors ${
              filtersOpen ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-200 ${filtersOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 pt-1">
            {["ყველა", ...positionTerms].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPosition(item)}
                className={`h-11 whitespace-nowrap rounded-full px-3 text-sm transition-all duration-200 ${
                  position === item
                    ? "bg-primary text-white shadow-sm"
                    : "border border-gray-300 bg-white text-gray-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </UICard>

      {loading ? <p className="text-sm text-gray-600">იტვირთება...</p> : null}

      {!loading && attendees.length === 0 ? (
        <UICard>
          <p className="text-sm text-gray-600">მონაცემი ვერ მოიძებნა. სცადე სხვა ფილტრი.</p>
        </UICard>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {attendees.map((attendee) => (
          <Link key={attendee.id} href={`/attendees/${attendee.id}`}>
            <UICard className="flex items-center gap-3 p-4 active:scale-[0.98]">
              <UIAvatar src={attendee.photoUrl} alt={attendee.fullName} size="sm" />
              <div className="min-w-0 space-y-1">
                <h3 className="truncate font-semibold text-gray-900">{attendee.fullName}</h3>
                <p className="truncate text-sm text-gray-700">{attendee.position || "პოზიცია არ არის მითითებული"}</p>
                <p className="truncate text-sm text-gray-600"><span className="sm:hidden">🏢 </span>{attendee.company || "კომპანია არ არის მითითებული"}</p>
              </div>
            </UICard>
          </Link>
        ))}
      </div>
    </section>
  );
}
