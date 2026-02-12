"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function Shell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasAttendeeCookie, setHasAttendeeCookie] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function updateAttendeeState() {
      try {
        const response = await fetch("/api/attendee-profile", { cache: "no-store" });
        setHasAttendeeCookie(response.ok);
      } catch {
        setHasAttendeeCookie(false);
      }
    }

    updateAttendeeState();

    window.addEventListener("focus", updateAttendeeState);
    return () => {
      window.removeEventListener("focus", updateAttendeeState);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/attendee/logout", { method: "POST" }).catch(() => null);
    setHasAttendeeCookie(false);
    setMenuOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-40 rounded-lg border border-gray-100 bg-white px-3 py-3 shadow-sm sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="text-lg font-bold text-primary">
            Attenda.ge
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
            aria-expanded={menuOpen}
            aria-label="მენიუ"
          >
            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>მენიუ</span>
          </button>
        </div>

        {menuOpen ? (
          <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-white p-3">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>მთავარი</span>
            </Link>

            <Link href="/attendees" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M3 20c1.2-3.1 3.5-5 5-5s3.8 1.9 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 20c.8-2 2.4-3.2 3.6-3.2 1.3 0 2.8 1.2 3.7 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>დამსწრეები</span>
            </Link>

            {!hasAttendeeCookie ? (
              <Link href="/register" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>რეგისტრაცია</span>
              </Link>
            ) : (
              <>
                <Link href="/me" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>ჩემი გვერდი</span>
                </Link>

                <Link href="/notifications" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" stroke="currentColor" strokeWidth="2" />
                    <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>შეტყობინებები</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M10 17l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>გამოსვლა</span>
                </button>
              </>
            )}
          </div>
        ) : null}
      </header>
      {children}
    </div>
  );
}
