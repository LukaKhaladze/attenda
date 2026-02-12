import { notFound } from "next/navigation";
import { ConferencePage } from "@/components/conference-page";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ConferenceSinglePage({ params }: { params: { slug: string } }) {
  const conference = await prisma.conference.findUnique({
    where: { slug: params.slug }
  });

  if (!conference) {
    notFound();
  }

  return (
    <Shell>
      <ConferencePage
        conference={{
          ...conference,
          agendaHighlights: (conference.agendaHighlights as string[] | null) ?? null,
          speakers: (conference.speakers as string[] | null) ?? null
        }}
      />
    </Shell>
  );
}
