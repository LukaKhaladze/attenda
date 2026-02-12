import Link from "next/link";
import { notFound } from "next/navigation";
import { MeetingOfferForm } from "@/components/meeting-offer-form";
import { Shell } from "@/components/shell";
import { UIAvatar } from "@/components/ui-avatar";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
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
      <section className="space-y-4 pb-8">
        <UIHeader title="პროფილი" backHref={`/attendees?conferenceId=${attendee.conferenceId}`} />

        <UICard className="bg-gradient-to-br from-primary to-accent text-center text-white">
          <div className="mb-3 flex justify-center">
            <UIAvatar src={attendee.photoUrl} alt={attendee.fullName} size="xl" />
          </div>
          <h1 className="text-2xl font-bold">{attendee.fullName}</h1>
          <p className="text-sm text-white/90">{attendee.position || "პოზიცია არ არის მითითებული"}</p>
          <p className="text-sm text-white/90">{attendee.company || "კომპანია არ არის მითითებული"}</p>
        </UICard>

        <UICard className="space-y-3">
          <a href={attendee.linkedinUrl} target="_blank" rel="noreferrer" className="block rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-white">
            LinkedIn-ზე გადასვლა
          </a>
          <Link href="/attendees" className="block rounded-md border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
            უკან სიაში
          </Link>
        </UICard>

        <MeetingOfferForm recipientAttendeeId={attendee.id} />

        <UICard>
          <h2 className="mb-2 text-base font-semibold text-primary">საკონტაქტო</h2>
          {attendee.sharePhonePublic ? (
            <p className="text-sm text-gray-700">📞 {attendee.phone}</p>
          ) : (
            <p className="text-sm text-gray-700">ტელეფონი დამალულია — დაუკავშირდი LinkedIn-ით</p>
          )}
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
