import { Shell } from "@/components/shell";
import { AttendeeProfileForm } from "@/components/attendee-profile-form";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { resolveLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function MePage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = resolveLang(searchParams.lang);
  return (
    <Shell>
      <section className="space-y-3">
        <UIHeader title={lang === "en" ? "My Profile" : "ჩემი პროფილი"} backHref="/" />
        <UICard>
          <p className="text-sm text-gray-700">{lang === "en" ? "Here you can edit all information you submitted during registration." : "აქ შეგიძლია შეცვალო შენზე რეგისტრაციაში შეყვანილი ყველა ინფორმაცია."}</p>
        </UICard>
        <AttendeeProfileForm lang={lang} />
      </section>
    </Shell>
  );
}
