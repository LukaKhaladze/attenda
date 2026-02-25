"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function Shell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasAttendeeCookie, setHasAttendeeCookie] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = "attenda_header_state_v1";

    function readCachedState() {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { at: number; isAttendee: boolean; unreadCount: number };
        if (Date.now() - parsed.at > 15_000) {
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }

    function saveCachedState(isAttendee: boolean, unread: number) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), isAttendee, unreadCount: unread }));
      } catch {
        // Ignore storage errors in private mode.
      }
    }

    async function updateState() {
      try {
        const cached = readCachedState();
        if (cached) {
          setHasAttendeeCookie(cached.isAttendee);
          setUnreadCount(pathname.startsWith("/notifications") ? 0 : cached.unreadCount);
          return;
        }

        const sessionResponse = await fetch("/api/attendee/session", {
          cache: "no-store",
          signal: controller.signal
        });
        const sessionData = await sessionResponse.json().catch(() => ({}));
        const isAttendee = Boolean(sessionResponse.ok && sessionData?.isAttendee);
        setHasAttendeeCookie(isAttendee);

        if (!isAttendee) {
          setUnreadCount(0);
          saveCachedState(false, 0);
          return;
        }

        if (pathname.startsWith("/notifications")) {
          setUnreadCount(0);
          saveCachedState(true, 0);
          return;
        }

        const countResponse = await fetch("/api/notifications/count", {
          cache: "no-store",
          signal: controller.signal
        });
        if (!countResponse.ok) {
          setUnreadCount(0);
          return;
        }

        const data = await countResponse.json().catch(() => ({}));
        const unread = Number(data?.unread || 0);
        setUnreadCount(unread);
        saveCachedState(true, unread);
      } catch {
        if (!controller.signal.aborted) {
          setHasAttendeeCookie(false);
          setUnreadCount(0);
        }
      }
    }

    updateState();

    window.addEventListener("focus", updateState);
    return () => {
      controller.abort();
      window.removeEventListener("focus", updateState);
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/attendee/logout", { method: "POST" }).catch(() => null);
    try {
      sessionStorage.removeItem("attenda_header_state_v1");
    } catch {
      // Ignore storage errors.
    }
    setHasAttendeeCookie(false);
    setUnreadCount(0);
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

          <div className="flex items-center gap-2">
            {hasAttendeeCookie ? (
              <Link
                href="/notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-primary"
                aria-label="შეტყობინებები"
                title="შეტყობინებები"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="2" />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

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
              <>
                <Link href="/register" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>რეგისტრაცია</span>
                </Link>

                <Link href="/auth/signin" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M10 17l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>შესვლა</span>
                </Link>
              </>
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
                  {unreadCount > 0 ? <span className="ml-auto text-xs font-semibold text-primary">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
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
