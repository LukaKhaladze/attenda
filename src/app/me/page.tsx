import { Shell } from "@/components/shell";
import { AttendeeProfileForm } from "@/components/attendee-profile-form";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";

export const dynamic = "force-dynamic";

export default function MePage() {
  return (
    <Shell>
      <section className="space-y-3">
        <UIHeader title="ჩემი პროფილი" backHref="/" />
        <UICard>
          <p className="text-sm text-gray-700">აქ შეგიძლია შეცვალო შენზე რეგისტრაციაში შეყვანილი ყველა ინფორმაცია.</p>
        </UICard>
        <AttendeeProfileForm />
      </section>
    </Shell>
  );
}
