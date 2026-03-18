import { cookies } from "next/headers";
import Link from "next/link";
import { AttendeesExplorer } from "@/components/attendees-explorer";
import { Shell } from "@/components/shell";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { prisma } from "@/lib/prisma";

export default async function AttendeesPage({ searchParams }: { searchParams: { conferenceId?: string } }) {
  const attendeeId = cookies().get("attendee_id")?.value;
  const conference = searchParams.conferenceId
    ? await prisma.conference.findUnique({
        where: { id: searchParams.conferenceId },
        select: { id: true, title_ka: true, slug: true }
      })
    : null;

  const currentAttendee = attendeeId
    ? await prisma.attendee.findUnique({
        where: { id: attendeeId },
        select: { conferenceId: true, status: true }
      })
    : null;

  const hasConferenceAccess = Boolean(
    !searchParams.conferenceId ||
      (conference &&
        currentAttendee &&
        currentAttendee.status === "APPROVED" &&
        currentAttendee.conferenceId === searchParams.conferenceId)
  );

  if (searchParams.conferenceId && conference && !hasConferenceAccess) {
    return (
      <Shell>
        <section className="space-y-4">
          <UIHeader title="დამსწრეები" backHref={conference.slug ? `/conference/${conference.slug}` : "/"} />
          <UICard className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{conference.title_ka}</h2>
            <p className="text-sm leading-6 text-gray-700">
              ამ ღონისძიების დამსწრეთა სიის სანახავად ჯერ უნდა დარეგისტრირდე ან შეხვიდე როგორც ამავე ღონისძიების დამსწრე.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={conference.slug ? `/register?conferenceSlug=${conference.slug}` : `/register?conferenceId=${searchParams.conferenceId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
              >
                რეგისტრაცია
              </Link>
              <Link
                href={conference.slug ? `/attendee/signin?conferenceSlug=${conference.slug}` : `/attendee/signin?conferenceId=${searchParams.conferenceId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary"
              >
                შესვლა
              </Link>
            </div>
          </UICard>
        </section>
      </Shell>
    );
  }

  const initialItems = await prisma.attendee.findMany({
    where: {
      status: "APPROVED",
      consentPublicList: true,
      ...(searchParams.conferenceId ? { conferenceId: searchParams.conferenceId } : {})
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      company: true,
      position: true,
      photoUrl: true
    },
    take: 60
  });

  return (
    <Shell>
      <section className="space-y-3">
        <UIHeader title="დამსწრეები" backHref={conference?.slug ? `/conference/${conference.slug}` : "/"} />
        <p className="text-sm text-gray-700">
          {searchParams.conferenceId ? "მხოლოდ ამ კონფერენციის დამსწრეები" : "იპოვე ადამიანები პროფესიული გაცნობისა და შეხვედრისთვის."}
        </p>
        <AttendeesExplorer conferenceId={searchParams.conferenceId} initialItems={initialItems} />
      </section>
    </Shell>
  );
}
