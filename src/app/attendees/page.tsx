import { AttendeesExplorer } from "@/components/attendees-explorer";
import { Shell } from "@/components/shell";
import { UIHeader } from "@/components/ui-header";

export default function AttendeesPage() {
  return (
    <Shell>
      <section className="space-y-3">
        <UIHeader title="დამსწრეები" backHref="/" />
        <p className="text-sm text-gray-700">იპოვე ადამიანები პროფესიული გაცნობისა და შეხვედრისთვის.</p>
        <AttendeesExplorer />
      </section>
    </Shell>
  );
}
