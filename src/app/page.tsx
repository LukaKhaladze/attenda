import { ConferenceCard } from "@/components/conference-card";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const conferences = await prisma.conference.findMany({
    orderBy: { date: "asc" }
  });

  return (
    <Shell>
      {conferences.length > 0 ? (
        <section className="space-y-4 pb-4">
          {conferences.map((conference) => (
            <ConferenceCard key={conference.id} conference={conference} />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-700 shadow-sm">
          კონფერენცია ჯერ არ არის დამატებული. ადმინისტრატორმა უნდა შეავსოს ინფორმაცია.
        </section>
      )}
    </Shell>
  );
}
