import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ConferencePage } from "@/components/conference-page";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function ConferenceSinglePage({ params }: { params: { slug: string } }) {
  const conference = await prisma.conference.findUnique({
    where: { slug: params.slug }
  });

  if (!conference) {
    notFound();
  }

  const requestHeaders = headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const origin =
    host
      ? `${forwardedProto || "https"}://${host}`
      : process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const shareUrl = `${origin}/conference/${conference.slug}`;

  return (
    <Shell>
      <ConferencePage
        conference={{
          ...conference,
          agendaHighlights: (conference.agendaHighlights as string[] | null) ?? null,
          speakers: (conference.speakers as string[] | null) ?? null
        }}
        shareUrl={shareUrl}
      />
    </Shell>
  );
}
