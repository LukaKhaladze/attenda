import { RegistrationForm } from "@/components/registration-form";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export default async function RegisterPage({ searchParams }: { searchParams: { conferenceId?: string } }) {
  const conference = searchParams.conferenceId
    ? await prisma.conference.findUnique({ where: { id: searchParams.conferenceId } })
    : await prisma.conference.findFirst({ orderBy: { date: "asc" } });

  return (
    <Shell>
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-brand-900">დარეგისტრირდი კონფერენციაზე</h1>
        {conference ? (
          <>
            <p className="text-brand-700">
              კონფერენცია: <strong>{conference.title_ka}</strong>
            </p>
            <RegistrationForm conferenceId={conference.id} />
          </>
        ) : (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-700">აქტიური კონფერენცია ვერ მოიძებნა.</p>
        )}
      </section>
    </Shell>
  );
}
