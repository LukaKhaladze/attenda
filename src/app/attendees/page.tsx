import { AttendeesExplorer } from "@/components/attendees-explorer";
import { Shell } from "@/components/shell";
import { UIHeader } from "@/components/ui-header";
import { prisma } from "@/lib/prisma";

export default async function AttendeesPage({ searchParams }: { searchParams: { conferenceId?: string } }) {
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
        <UIHeader title="დამსწრეები" backHref="/" />
        <p className="text-sm text-gray-700">
          {searchParams.conferenceId ? "მხოლოდ ამ კონფერენციის დამსწრეები" : "იპოვე ადამიანები პროფესიული გაცნობისა და შეხვედრისთვის."}
        </p>
        <AttendeesExplorer conferenceId={searchParams.conferenceId} initialItems={initialItems} />
      </section>
    </Shell>
  );
}
