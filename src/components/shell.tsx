import Link from "next/link";
import { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white/80 px-5 py-4 shadow-soft backdrop-blur">
        <Link href="/" className="text-xl font-semibold text-brand-800">
          Attenda.ge
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-800" href="/register">
            დარეგისტრირდი
          </Link>
          <Link className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-800" href="/attendees">
            დამსწრეთა სია
          </Link>
          <Link className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-800" href="/admin">
            ადმინი
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
