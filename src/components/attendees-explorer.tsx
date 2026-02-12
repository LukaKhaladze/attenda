"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Attendee = {
  id: string;
  fullName: string;
  company: string | null;
  position: string | null;
  photoUrl: string | null;
  createdAt: string;
  linkedinUrl: string;
};

export function AttendeesExplorer() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [hasCompany, setHasCompany] = useState("false");
  const [hasLinkedin, setHasLinkedin] = useState("false");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      const params = new URLSearchParams({
        q,
        hasCompany,
        hasLinkedin,
        sort
      });
      const response = await fetch(`/api/attendees?${params.toString()}`, {
        signal: controller.signal
      });
      const data = await response.json();
      setAttendees(data.items ?? []);
      setLoading(false);
    }

    load().catch(() => setLoading(false));

    return () => controller.abort();
  }, [q, hasCompany, hasLinkedin, sort]);

  return (
    <section className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 md:grid-cols-4">
        <input placeholder="ძიება სახელით ან კომპანიით" value={q} onChange={(event) => setQ(event.target.value)} />
        <select value={hasCompany} onChange={(event) => setHasCompany(event.target.value)}>
          <option value="false">კომპანია აქვს: ყველა</option>
          <option value="true">მხოლოდ კომპანია აქვს</option>
        </select>
        <select value={hasLinkedin} onChange={(event) => setHasLinkedin(event.target.value)}>
          <option value="false">LinkedIn აქვს: ყველა</option>
          <option value="true">მხოლოდ LinkedIn აქვს</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="new">ახალი დამატებული</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      {loading ? <p className="text-sm text-brand-700">იტვირთება...</p> : null}

      {!loading && attendees.length === 0 ? (
        <p className="rounded-2xl border border-brand-100 bg-white p-5 text-sm text-brand-700">
          მონაცემი ვერ მოიძებნა. სცადე სხვა ფილტრი.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {attendees.map((attendee) => (
          <Link
            key={attendee.id}
            href={`/attendees/${attendee.id}`}
            className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft hover:-translate-y-0.5"
          >
            <div className="mb-3 h-40 rounded-xl bg-brand-50 bg-cover bg-center" style={{ backgroundImage: attendee.photoUrl ? `url(${attendee.photoUrl})` : undefined }} />
            <h3 className="font-semibold text-brand-900">{attendee.fullName}</h3>
            <p className="text-sm text-brand-700">{attendee.company || "კომპანია მითითებული არ არის"}</p>
            <p className="text-sm text-brand-700">{attendee.position || "პოზიცია მითითებული არ არის"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
