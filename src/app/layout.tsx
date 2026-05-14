import type { Metadata } from "next";
import { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppPreloader } from "@/components/app-preloader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Networkapp - კონფერენციების მართვა და ნეთვორქინგი",
  description: "კონფერენციის გვერდები, ჰოსტის მართვა, დამსწრეთა approval და ნეთვორქინგი ერთ პლატფორმაში"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ka-GE">
      <body>
        <main className="min-h-screen w-full bg-background px-4 py-4 sm:px-6 lg:px-8">
          <AppPreloader />
          {children}
        </main>
        <SpeedInsights />
      </body>
    </html>
  );
}
