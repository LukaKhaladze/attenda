import { AttendeesExplorer } from "@/components/attendees-explorer";
import { Shell } from "@/components/shell";

export default function AttendeesPage() {
  return (
    <Shell>
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-brand-900">დამსწრეთა სია</h1>
        <p className="text-brand-700">იპოვე ადამიანები პროფესიული გაცნობისა და შეხვედრისთვის.</p>
        <AttendeesExplorer />
      </section>
    </Shell>
  );
}
