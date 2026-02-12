"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

export function Shell({ children }: { children: ReactNode }) {
  const [hasAttendeeCookie, setHasAttendeeCookie] = useState(false);

  useEffect(() => {
    setHasAttendeeCookie(document.cookie.includes("attendee_id="));
  }, []);

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-3 shadow-sm sm:px-4">
        <Link href="/" className="text-lg font-bold text-primary">
          Attenda.ge
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link className="rounded-full border border-gray-200 px-3 py-1.5 text-gray-700" href="/register">
            რეგისტრაცია
          </Link>
          <Link className="rounded-full border border-gray-200 px-3 py-1.5 text-gray-700" href="/">
            კონფერენციები
          </Link>

          {hasAttendeeCookie ? (
            <>
              <Link href="/notifications" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-primary" aria-label="შეტყობინებები">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>
              <Link href="/me" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-primary" aria-label="პროფილი">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>
            </>
          ) : null}

          <Link href="/auth/signin" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-primary" aria-label="შესვლა">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" />
              <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" />
              <path d="M15 12H3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
