import Link from "next/link";
import { notFound } from "next/navigation";
import { MeetingOfferForm } from "@/components/meeting-offer-form";
import { Shell } from "@/components/shell";
import { UIAvatar } from "@/components/ui-avatar";
import { UICard } from "@/components/ui-card";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function AttendeeDetailPage({ params }: { params: { id: string } }) {
  const attendee = await prisma.attendee.findUnique({
    where: { id: params.id },
    include: { conference: true }
  });

  if (!attendee || !attendee.consentPublicList || attendee.status !== "APPROVED") {
    notFound();
  }

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="sticky top-0 z-50 border-b border-gray-200 bg-background/95 py-3 backdrop-blur">
          <Link
            href={`/attendees?conferenceId=${attendee.conferenceId}`}
            className="inline-flex min-h-11 items-center rounded-full border border-gray-200 px-4 text-sm text-gray-700"
          >
            უკან
          </Link>
        </div>

        <UICard className="space-y-3 bg-gradient-to-br from-primary to-accent text-center text-white">
          <div className="flex justify-center">
            <UIAvatar src={attendee.photoUrl} alt={attendee.fullName} size="xl" />
          </div>
          <h1 className="text-2xl font-bold">{attendee.fullName}</h1>
          <p className="text-sm text-white/95">{attendee.position || "პოზიცია არ არის მითითებული"}</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-white/95">{attendee.company || "კომპანია არ არის მითითებული"}</p>
            {attendee.linkedinUrl ? (
              <a
                href={attendee.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 8v9M7 5h.01M12 17v-5a2 2 0 114 0v5M3 8h4v9H3zM11 8h4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </a>
            ) : null}
          </div>
        </UICard>

        <UICard className="space-y-3">
          <a
            href="#meeting-form"
            className="flex min-h-11 items-center justify-center rounded-xl border border-primary px-4 py-3 text-center text-sm font-medium text-primary"
          >
            შეხვედრის დანიშვნა
          </a>
        </UICard>

        <div id="meeting-form">
          <MeetingOfferForm recipientAttendeeId={attendee.id} />
        </div>

        <UICard>
          <h2 className="mb-2 text-base font-semibold text-primary">ამ ღინისძიებიდან მაინტერესებს</h2>
          <p className="text-sm leading-7 text-gray-700">{attendee.motivation || "მოტივაცია არ არის მითითებული."}</p>
        </UICard>

        <UICard>
          <h3 className="font-semibold text-primary">კონფერენცია</h3>
          <p className="text-sm text-gray-700">{attendee.conference.title_ka}</p>
          <p className="text-sm text-gray-700">{attendee.conference.location_ka}</p>
        </UICard>
      </section>
    </Shell>
  );
}
