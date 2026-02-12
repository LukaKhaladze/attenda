import { AttendeesExplorer } from "@/components/attendees-explorer";
import { Shell } from "@/components/shell";
import { UIHeader } from "@/components/ui-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AttendeesPage({ searchParams }: { searchParams: { conferenceId?: string } }) {
  const conference = searchParams.conferenceId
    ? await prisma.conference.findUnique({ where: { id: searchParams.conferenceId } })
    : null;

  return (
    <Shell>
      <section className="space-y-3">
        <UIHeader title="დამსწრეები" backHref={conference ? `/conference/${conference.slug}` : "/"} />
        <p className="text-sm text-gray-700">
          {conference ? `მხოლოდ ${conference.title_ka}-ის დამსწრეები` : "იპოვე ადამიანები პროფესიული გაცნობისა და შეხვედრისთვის."}
        </p>
        <AttendeesExplorer conferenceId={searchParams.conferenceId} />
      </section>
    </Shell>
  );
}
