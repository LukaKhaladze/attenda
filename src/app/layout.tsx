import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attenda.ge - კონფერენციის ქსელი",
  description: "კონფერენციის დამსწრეთა რეგისტრაცია და პროფესიული ქსელის მართვა"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ka-GE">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-6xl bg-background px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
