import Link from "next/link";
import { notFound } from "next/navigation";
import { MeetingActions } from "@/components/meeting-actions";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AttendeeDetailPage({ params }: { params: { id: string } }) {
  const attendee = await prisma.attendee.findUnique({
    where: { id: params.id },
    include: {
      conference: true
    }
  });

  if (!attendee || !attendee.consentPublicList || attendee.status !== "APPROVED") {
    notFound();
  }

  return (
    <Shell>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <article className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <div className="h-56 rounded-2xl bg-brand-50 bg-cover bg-center" style={{ backgroundImage: attendee.photoUrl ? `url(${attendee.photoUrl})` : undefined }} />
          <h1 className="text-3xl font-bold text-brand-900">{attendee.fullName}</h1>
          <p className="text-brand-700">{attendee.company || "კომპანია არ არის მითითებული"}</p>
          <p className="text-brand-700">{attendee.position || "პოზიცია არ არის მითითებული"}</p>

          <div className="flex flex-wrap gap-3">
            <a
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              href={attendee.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn-ზე გადასვლა
            </a>
            <Link href="/attendees" className="rounded-xl bg-brand-100 px-4 py-2 text-sm font-medium text-brand-800">
              უკან სიაში
            </Link>
          </div>

          <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
            <h2 className="mb-2 text-base font-semibold">დაკავშირება</h2>
            {attendee.sharePhonePublic ? (
              <p>ტელეფონი: {attendee.phone}</p>
            ) : (
              <p>ტელეფონი დამალულია — დაუკავშირდი LinkedIn-ით</p>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <MeetingActions attendeeId={attendee.id} />
          <div className="rounded-2xl border border-brand-100 bg-white p-4">
            <h3 className="font-semibold text-brand-900">კონფერენცია</h3>
            <p className="text-sm text-brand-700">{attendee.conference.title_ka}</p>
            <p className="text-sm text-brand-700">{attendee.conference.location_ka}</p>
          </div>
        </aside>
      </section>
    </Shell>
  );
}
