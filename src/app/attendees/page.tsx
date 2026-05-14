import { cookies } from "next/headers";
import Link from "next/link";
import { AttendeesExplorer } from "@/components/attendees-explorer";
import { Shell } from "@/components/shell";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { normalizeStoredImageUrl } from "@/lib/image-url";
import { resolveLang } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function AttendeesPage({ searchParams }: { searchParams: { conferenceId?: string; lang?: string } }) {
  const lang = resolveLang(searchParams.lang);
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
          <UIHeader title={lang === "en" ? "Attendees" : "დამსწრეები"} backHref={conference.slug ? `/conference/${conference.slug}${lang === "en" ? "?lang=en" : ""}` : "/"} />
          <UICard className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{conference.title_ka}</h2>
            <p className="text-sm leading-6 text-gray-700">
              {lang === "en"
                ? "To see this event attendee list, first register or sign in as an attendee of the same event."
                : "ამ ღონისძიების დამსწრეთა სიის სანახავად ჯერ უნდა დარეგისტრირდე ან შეხვიდე როგორც ამავე ღონისძიების დამსწრე."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={conference.slug ? `/register?conferenceSlug=${conference.slug}${lang === "en" ? "&lang=en" : ""}` : `/register?conferenceId=${searchParams.conferenceId}${lang === "en" ? "&lang=en" : ""}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
              >
                {lang === "en" ? "Register" : "რეგისტრაცია"}
              </Link>
              <Link
                href={conference.slug ? `/attendee/signin?conferenceSlug=${conference.slug}${lang === "en" ? "&lang=en" : ""}` : `/attendee/signin?conferenceId=${searchParams.conferenceId}${lang === "en" ? "&lang=en" : ""}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary"
              >
                {lang === "en" ? "Sign In" : "შესვლა"}
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
        <UIHeader title={lang === "en" ? "Attendees" : "დამსწრეები"} backHref={conference?.slug ? `/conference/${conference.slug}${lang === "en" ? "?lang=en" : ""}` : "/"} />
        <p className="text-sm text-gray-700">
          {searchParams.conferenceId
            ? (lang === "en" ? "Only attendees from this conference" : "მხოლოდ ამ კონფერენციის დამსწრეები")
            : (lang === "en" ? "Find people for networking and meetings." : "იპოვე ადამიანები პროფესიული გაცნობისა და შეხვედრისთვის.")}
        </p>
        <AttendeesExplorer
          conferenceId={searchParams.conferenceId}
          lang={lang}
          initialItems={initialItems.map((item) => ({ ...item, photoUrl: normalizeStoredImageUrl(item.photoUrl) }))}
        />
      </section>
    </Shell>
  );
}
