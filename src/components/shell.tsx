import Link from "next/link";
import { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-40 flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <Link href="/" className="text-lg font-bold text-primary">
          Attenda.ge
        </Link>
        <nav className="flex gap-2 text-xs">
          <Link className="rounded-full border border-gray-200 px-3 py-1.5 text-gray-700" href="/register">
            რეგისტრაცია
          </Link>
          <Link className="rounded-full border border-gray-200 px-3 py-1.5 text-gray-700" href="/attendees">
            დამსწრეები
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
