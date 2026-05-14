import { RegistrationForm } from "@/components/registration-form";
import { Shell } from "@/components/shell";
import { resolveLang } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: { conferenceId?: string; conferenceSlug?: string; lang?: string };
}) {
  const lang = resolveLang(searchParams.lang);
  const conference = searchParams.conferenceId
    ? await prisma.conference.findUnique({ where: { id: searchParams.conferenceId } })
    : searchParams.conferenceSlug
      ? await prisma.conference.findUnique({ where: { slug: searchParams.conferenceSlug } })
      : await prisma.conference.findFirst({ orderBy: { date: "asc" } });

  return (
    <Shell>
      {conference ? (
        <RegistrationForm conferenceId={conference.id} lang={lang} />
      ) : (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">{lang === "en" ? "No active conference found." : "აქტიური კონფერენცია ვერ მოიძებნა."}</p>
      )}
    </Shell>
  );
}
