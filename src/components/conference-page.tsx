"use client";

import { Conference } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { UICard } from "@/components/ui-card";

type Props = {
  conference: Conference & { agendaHighlights: string[] | null; speakers: string[] | null };
  shareUrl: string;
};

export function ConferencePage({ conference, shareUrl }: Props) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;
  const [expandedDescription, setExpandedDescription] = useState(false);
  const agendaCount = conference.agendaHighlights?.length ?? 0;
  const speakerCount = conference.speakers?.length ?? 0;

  return (
    <section className="space-y-6 pb-24">
      <UICard className="overflow-hidden p-0">
        <div
          className="h-64 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(17,24,39,.2), rgba(30,58,138,.75)), url(${conference.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80"})`
          }}
        >
          <div className="flex h-full flex-col justify-end p-4 text-white">
            <h1 className="text-3xl font-bold">{conference.title_ka}</h1>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="2" />
              </svg>
              {format(conference.date, "dd MMMM")}
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
              </svg>
              {conference.location_ka}
            </p>
          </div>

          <p className={`text-sm leading-7 text-gray-700 ${expandedDescription ? "" : "line-clamp-3"}`}>
            {conference.description_ka}
          </p>
          <button type="button" onClick={() => setExpandedDescription((value) => !value)} className="text-sm font-medium text-primary underline">
            {expandedDescription ? "ნაკლების ნახვა" : "სრულად ნახვა"}
          </button>
        </div>
      </UICard>

      <div className="space-y-3">
        <Link href={`/attendees?conferenceId=${conference.id}`}>
          <UICard className="flex h-[72px] items-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.99]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M3 20c1.2-3.1 3.5-5 5-5s3.8 1.9 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-gray-900">დამსწრეები 500+</span>
          </UICard>
        </Link>

        <a href="#agenda">
          <UICard className="flex h-[72px] items-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.99]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-gray-900">დღის წესრიგი {agendaCount > 0 ? `(${agendaCount})` : ""}</span>
          </UICard>
        </a>

        <a href="#speakers">
          <UICard className="flex h-[72px] items-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.99]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
                <path d="M5 19c1.5-3.1 4.3-5 7-5s5.5 1.9 7 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-gray-900">სპიკერები {speakerCount > 0 ? `(${speakerCount})` : ""}</span>
          </UICard>
        </a>

        <Link href={`/attendees?conferenceId=${conference.id}`}>
          <UICard className="flex h-[72px] items-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.99]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2l2.4 4.8L20 8l-4 3.8L17 17l-5-2.6L7 17l1-5.2L4 8l5.6-1.2L12 2z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-gray-900">სტუმრები</span>
          </UICard>
        </Link>
      </div>

      {agendaCount > 0 ? (
        <UICard id="agenda" className="space-y-2">
          <h2 className="text-base font-semibold text-primary">დღის წესრიგი</h2>
          <ul className="space-y-2">
            {conference.agendaHighlights?.map((item) => (
              <li key={item} className="text-sm text-gray-700">• {item}</li>
            ))}
          </ul>
        </UICard>
      ) : null}

      {speakerCount > 0 ? (
        <UICard id="speakers" className="space-y-2">
          <h2 className="text-base font-semibold text-primary">სპიკერები</h2>
          <ul className="space-y-2">
            {conference.speakers?.map((item) => (
              <li key={item} className="text-sm text-gray-700">• {item}</li>
            ))}
          </ul>
        </UICard>
      ) : null}

      <UICard className="space-y-3">
        <h2 className="text-base font-semibold text-primary">გააზიარე ეს კონფერენცია</h2>
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="კონფერენციის QR კოდი" className="h-44 w-44 rounded-lg border border-gray-200 bg-white p-2" />
        </div>
        <p className="break-all rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">{shareUrl}</p>
      </UICard>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4">
        <div className="mx-auto flex w-full max-w-[430px] gap-2">
          <Link href={`/register?conferenceId=${conference.id}`} className="w-full rounded-xl bg-primary px-4 py-3 text-center text-base font-medium text-white">
            დარეგისტრირდი
          </Link>
          <Link href={`/attendees?conferenceId=${conference.id}`} className="w-full rounded-xl border-2 border-primary px-4 py-3 text-center text-base font-medium text-primary">
            დამსწრეთა ნახვა
          </Link>
        </div>
      </div>
    </section>
  );
}
