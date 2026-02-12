"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
};

function NavItem({ href, label, icon }: NavItemProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-700 sm:text-sm">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [hasAttendeeCookie, setHasAttendeeCookie] = useState(false);

  useEffect(() => {
    function updateAttendeeState() {
      setHasAttendeeCookie(document.cookie.includes("attendee_id="));
    }

    updateAttendeeState();

    window.addEventListener("focus", updateAttendeeState);
    return () => {
      window.removeEventListener("focus", updateAttendeeState);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/attendee/logout", { method: "POST" }).catch(() => null);
    setHasAttendeeCookie(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-3 shadow-sm sm:px-4">
        <Link href="/" className="text-lg font-bold text-primary">
          Attenda.ge
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <NavItem
            href="/register"
            label="რეგისტრაცია"
            icon={
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />

          {hasAttendeeCookie ? (
            <>
              <NavItem
                href="/notifications"
                label="შეტყობინებები"
                icon={
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" stroke="currentColor" strokeWidth="2" />
                    <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="2" />
                  </svg>
                }
              />
              <NavItem
                href="/me"
                label="პროფილი"
                icon={
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                }
              />
            </>
          ) : null}

          {hasAttendeeCookie ? (
            <>
              <NavItem
                href="/me"
                label="ჩემი გვერდი"
                icon={
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                }
              />
              <Link
                href="/notifications"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-primary"
                aria-label="შეტყობინებები"
                title="შეტყობინებები"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h11z" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-700 sm:text-sm"
              >
                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M10 17l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M5 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M14 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>გამოსვლა</span>
              </button>
            </>
          ) : null}
        </nav>
      </header>
      {children}
    </div>
  );
}
