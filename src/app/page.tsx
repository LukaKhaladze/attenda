import { ConferencePage } from "@/components/conference-page";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const conference = await prisma.conference.findFirst({
    orderBy: { date: "asc" }
  });

  return (
    <Shell>
      {conference ? (
        <ConferencePage
          conference={{
            ...conference,
            agendaHighlights: (conference.agendaHighlights as string[] | null) ?? null,
            speakers: (conference.speakers as string[] | null) ?? null
          }}
        />
      ) : (
        <section className="rounded-3xl border border-brand-100 bg-white p-6 text-brand-800 shadow-soft">
          კონფერენცია ჯერ არ არის დამატებული. ადმინისტრატორმა უნდა შეავსოს ინფორმაცია.
        </section>
      )}
    </Shell>
  );
}
