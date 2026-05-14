"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import darkLogo from "../../dark.png";

export function Shell({ children, hideHeader = false }: { children: ReactNode; hideHeader?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [hasAttendeeCookie, setHasAttendeeCookie] = useState(false);
  const [hasConferenceAccess, setHasConferenceAccess] = useState(false);
  const [hasUserSession, setHasUserSession] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isPublicConferencePage = pathname.startsWith("/conference/");
  const conferenceSlug = isPublicConferencePage ? pathname.split("/")[2] ?? "" : "";
  const isAdminArea = pathname.startsWith("/admin");
  const isHostArea = pathname.startsWith("/host");
  const isHostSession = hasUserSession && userRole === "HOST";
  const isAdminSession = hasUserSession && userRole === "ADMIN";
  const hostConferenceIdFromPath = pathname.startsWith("/host/conferences/") ? pathname.split("/")[3] ?? "" : "";
  const [lastHostConferenceId, setLastHostConferenceId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = `attenda_header_state_v3:${isPublicConferencePage ? conferenceSlug : "global"}`;

    function readCachedState() {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as {
          at: number;
          isAttendee: boolean;
          hasConferenceAccess: boolean;
          unreadCount: number;
        };
        if (Date.now() - parsed.at > 15_000) {
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }

    function saveCachedState(isAttendee: boolean, access: boolean, unread: number) {
      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ at: Date.now(), isAttendee, hasConferenceAccess: access, unreadCount: unread })
        );
      } catch {
        // Ignore storage errors in private mode.
      }
    }

    async function updateState() {
      try {
        const authSessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
          signal: controller.signal
        });
        const authSessionData = await authSessionResponse.json().catch(() => null);
        const hasUser = Boolean(authSessionData?.user?.email);
        const role = typeof authSessionData?.user?.role === "string" ? authSessionData.user.role : null;
        setHasUserSession(hasUser);
        setUserRole(role);

        const cached = readCachedState();
        if (cached) {
          setHasAttendeeCookie(cached.isAttendee);
          setHasConferenceAccess(cached.hasConferenceAccess);
          setUnreadCount(pathname.startsWith("/notifications") ? 0 : cached.unreadCount);
          return;
        }

        const sessionUrl = new URL("/api/attendee/session", window.location.origin);
        if (isPublicConferencePage && conferenceSlug) {
          sessionUrl.searchParams.set("conferenceSlug", conferenceSlug);
        }

        const sessionResponse = await fetch(sessionUrl.toString(), {
          cache: "no-store",
          signal: controller.signal
        });
        const sessionData = await sessionResponse.json().catch(() => ({}));
        const isAttendee = Boolean(sessionResponse.ok && sessionData?.isAttendee);
        const access = Boolean(sessionResponse.ok && sessionData?.hasConferenceAccess);
        setHasAttendeeCookie(isAttendee);
        setHasConferenceAccess(access);

        if (!isAttendee) {
          setUnreadCount(0);
          saveCachedState(false, false, 0);
          return;
        }

        if (pathname.startsWith("/notifications")) {
          setUnreadCount(0);
          saveCachedState(true, access, 0);
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
        saveCachedState(true, access, unread);
      } catch {
        if (!controller.signal.aborted) {
          setHasAttendeeCookie(false);
          setHasConferenceAccess(false);
          setHasUserSession(false);
          setUserRole(null);
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

  useEffect(() => {
    const attendeeConferenceIdFromQuery =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("conferenceId") ?? "" : "";

    if (hostConferenceIdFromPath) {
      setLastHostConferenceId(hostConferenceIdFromPath);
      try {
        sessionStorage.setItem("attenda_last_host_conference_id", hostConferenceIdFromPath);
      } catch {
        // Ignore storage errors.
      }
      return;
    }

    if (attendeeConferenceIdFromQuery && isHostSession) {
      setLastHostConferenceId(attendeeConferenceIdFromQuery);
      try {
        sessionStorage.setItem("attenda_last_host_conference_id", attendeeConferenceIdFromQuery);
      } catch {
        // Ignore storage errors.
      }
      return;
    }

    try {
      const stored = sessionStorage.getItem("attenda_last_host_conference_id");
      if (stored) {
        setLastHostConferenceId(stored);
      }
    } catch {
      // Ignore storage errors.
    }
  }, [hostConferenceIdFromPath, isHostSession, pathname]);

  async function handleLogout() {
    await fetch("/api/attendee/logout", { method: "POST" }).catch(() => null);
    if (hasUserSession) {
      await signOut({ redirect: false });
    }
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith("attenda_header_state_v3:"))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // Ignore storage errors.
    }
    setHasAttendeeCookie(false);
    setHasConferenceAccess(false);
    setHasUserSession(false);
    setUserRole(null);
    setUnreadCount(0);
    setMenuOpen(false);
    router.refresh();
  }

  const showAttendeeActions = hasAttendeeCookie && (!isPublicConferencePage || hasConferenceAccess);
  const hasAnySession = showAttendeeActions || hasUserSession;
  const showAdminDashboard = isAdminSession;
  const showHostDashboard = isHostSession;
  const registerHref = isPublicConferencePage && conferenceSlug ? `/register?conferenceSlug=${conferenceSlug}` : "/register";
  const attendeeSignInHref = isPublicConferencePage && conferenceSlug ? `/attendee/signin?conferenceSlug=${conferenceSlug}` : "/attendee/signin";
  const hostAttendeesHref = lastHostConferenceId ? `/host/conferences/${lastHostConferenceId}` : "/host";
  const primaryHomeHref = isAdminSession || isAdminArea ? "/admin" : isHostSession || isHostArea ? "/host" : "/";
  const isEnglish = new URLSearchParams(search).get("lang") === "en";

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSearch(window.location.search);
  }, [pathname]);

  function toggleLanguage() {
    const params = new URLSearchParams(search);
    if (isEnglish) {
      params.delete("lang");
    } else {
      params.set("lang", "en");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="space-y-4">
      {!hideHeader ? (
        <header className="sticky top-0 z-40 rounded-[22px] border border-[#d7e7fb] bg-white/92 px-3 py-3 shadow-[0_18px_42px_rgba(37,99,235,0.08)] backdrop-blur sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <Link href={primaryHomeHref} className="flex items-center">
            <Image src={darkLogo} alt="Networkapp" className="h-auto w-[148px] sm:w-[168px]" priority={false} />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#d7e7fb] px-3 text-xs font-semibold text-[#3173f1]"
              aria-label="Switch language"
            >
              {isEnglish ? "KA" : "EN"}
            </button>
            {showAttendeeActions ? (
              <Link
                href="/notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7e7fb] text-[#3173f1]"
                aria-label={isEnglish ? "Notifications" : "შეტყობინებები"}
                title={isEnglish ? "Notifications" : "შეტყობინებები"}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="2" />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#3173f1] px-1 text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-[#d7e7fb] px-3 py-1.5 text-sm text-[#334155]"
              aria-expanded={menuOpen}
              aria-label={isEnglish ? "Menu" : "მენიუ"}
            >
              <svg className="h-4 w-4 text-[#3173f1]" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{isEnglish ? "Menu" : "მენიუ"}</span>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="mt-3 space-y-2 rounded-2xl border border-[#d7e7fb] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <Link href={primaryHomeHref} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>მთავარი</span>
            </Link>

            {!hasAnySession ? (
              <>
                <Link href="/attendees" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                    <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 20c1.2-3.1 3.5-5 5-5s3.8 1.9 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 20c.8-2 2.4-3.2 3.6-3.2 1.3 0 2.8 1.2 3.7 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>დამსწრეები</span>
                </Link>

                <Link href={registerHref} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>რეგისტრაცია</span>
                </Link>

                <Link href={isPublicConferencePage ? attendeeSignInHref : "/auth/signin"} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M10 17l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>შესვლა</span>
                </Link>

                {!isPublicConferencePage ? (
                  <Link href="/auth/signin" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M10 17l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>ადმინი</span>
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                {isHostSession ? (
                  <>
                    <Link href={hostAttendeesHref} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                        <path d="M3 20c1.2-3.1 3.5-5 5-5s3.8 1.9 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M13 20c.8-2 2.4-3.2 3.6-3.2 1.3 0 2.8 1.2 3.7 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>დამსწრეები</span>
                    </Link>
                  </>
                ) : null}

                {isAdminSession ? (
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

                    <Link href="/admin" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 8h10M7 12h6M7 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>ღონისძიებები</span>
                    </Link>
                  </>
                ) : null}

                {showAttendeeActions && !isAdminSession && !isHostSession ? (
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
                  </>
                ) : null}

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
      ) : null}
      {children}
    </div>
  );
}
