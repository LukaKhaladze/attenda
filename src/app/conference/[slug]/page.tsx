import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { ConferencePage } from "@/components/conference-page";
import { Shell } from "@/components/shell";
import { resolveLang } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { richTextCountBlocks, richTextFromStored } from "@/lib/rich-text";

export const revalidate = 60;

function resolveOrigin() {
  const requestHeaders = headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  return host
    ? `${forwardedProto || "https"}://${host}`
    : process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const conference = await prisma.conference.findUnique({
    where: { slug: params.slug },
    select: { title_ka: true, slug: true, description_ka: true, coverImageUrl: true }
  });

  if (!conference) {
    return {};
  }

  const origin = resolveOrigin();
  const shareUrl = `${origin}/conference/${conference.slug}`;
  const ogImage = `${origin}/api/conference-og/${conference.slug}`;
  const plainDescription = richTextFromStored(conference.description_ka).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return {
    title: conference.title_ka,
    description: plainDescription,
    openGraph: {
      title: conference.title_ka,
      description: plainDescription,
      url: shareUrl,
      type: "website",
      images: [{ url: ogImage, width: 1400, height: 900 }]
    },
    twitter: {
      card: "summary_large_image",
      title: conference.title_ka,
      description: plainDescription,
      images: [ogImage]
    }
  };
}

export default async function ConferenceSinglePage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { lang?: string };
}) {
  const conference = await prisma.conference.findUnique({
    where: { slug: params.slug }
  });

  if (!conference) {
    notFound();
  }

  const origin = resolveOrigin();
  const lang = resolveLang(searchParams.lang);
  const shareUrl = `${origin}/conference/${conference.slug}`;
  const descriptionHtml = richTextFromStored(conference.description_ka);
  const agendaHtml = richTextFromStored(conference.agendaHighlights);
  const speakersHtml = richTextFromStored(conference.speakers);

  const attendeeId = cookies().get("attendee_id")?.value;
  const attendee = attendeeId
    ? await prisma.attendee.findUnique({
        where: { id: attendeeId },
        select: {
          conferenceId: true,
          status: true
        }
      })
    : null;
  const isRegisteredForConference = Boolean(
    attendee && attendee.status === "APPROVED" && attendee.conferenceId === conference.id
  );
  const attendeeCount = await prisma.attendee.count({
    where: { conferenceId: conference.id, status: "APPROVED" }
  });

  return (
    <Shell>
      <ConferencePage
        conference={{
          ...conference,
          description_ka: descriptionHtml,
          agendaHighlights: null,
          speakers: null
        }}
        shareUrl={shareUrl}
        isRegisteredForConference={isRegisteredForConference}
        attendeeCount={attendeeCount}
        agendaHtml={agendaHtml}
        speakersHtml={speakersHtml}
        speakerCount={richTextCountBlocks(speakersHtml)}
        lang={lang}
      />
    </Shell>
  );
}
