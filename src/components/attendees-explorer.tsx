"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UICard } from "@/components/ui-card";
import { UIAvatar } from "@/components/ui-avatar";

type Attendee = {
  id: string;
  fullName: string;
  company: string | null;
  position: string | null;
  photoUrl: string | null;
  createdAt: string;
  linkedinUrl: string;
};

type Props = {
  conferenceId?: string;
};

export function AttendeesExplorer({ conferenceId }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [hasCompany, setHasCompany] = useState("false");
  const [hasLinkedin, setHasLinkedin] = useState("false");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ q: debouncedQ, hasCompany, hasLinkedin, sort });
      if (conferenceId) params.set("conferenceId", conferenceId);
      const response = await fetch(`/api/attendees?${params.toString()}`, { signal: controller.signal });
      const data = await response.json();
      setAttendees(data.items ?? []);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedQ, hasCompany, hasLinkedin, sort, conferenceId]);

  return (
    <section className="space-y-3">
      <UICard className="space-y-2">
        <input placeholder="🔍 ძიება სახელით ან კომპანიით" value={q} onChange={(event) => setQ(event.target.value)} />
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setHasCompany("false")}
            className={`rounded-full px-3 py-1.5 text-sm ${hasCompany === "false" ? "bg-primary text-white" : "border border-gray-300 text-gray-700"}`}
          >
            ყველა
          </button>
          <button
            type="button"
            onClick={() => setHasCompany("true")}
            className={`rounded-full px-3 py-1.5 text-sm ${hasCompany === "true" ? "bg-primary text-white" : "border border-gray-300 text-gray-700"}`}
          >
            კომპანია აქვს
          </button>
          <button
            type="button"
            onClick={() => setSort(sort === "new" ? "az" : "new")}
            className="rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
          >
            {sort === "new" ? "ახალი" : "A-Z"}
          </button>
        </div>
        <select value={hasLinkedin} onChange={(event) => setHasLinkedin(event.target.value)}>
          <option value="false">LinkedIn: ყველა</option>
          <option value="true">LinkedIn აქვს</option>
        </select>
      </UICard>

      {loading ? <p className="text-sm text-gray-600">იტვირთება...</p> : null}

      {!loading && attendees.length === 0 ? (
        <UICard>
          <p className="text-sm text-gray-600">მონაცემი ვერ მოიძებნა. სცადე სხვა ფილტრი.</p>
        </UICard>
      ) : null}

      <div className="space-y-3">
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
