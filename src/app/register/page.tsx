import { RegistrationRoleSwitcher } from "@/components/registration-role-switcher";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: { conferenceId?: string } }) {
  const conference = searchParams.conferenceId
    ? await prisma.conference.findUnique({ where: { id: searchParams.conferenceId } })
    : await prisma.conference.findFirst({ orderBy: { date: "asc" } });

  return (
    <Shell>
      <RegistrationRoleSwitcher conferenceId={conference?.id ?? null} />
    </Shell>
  );
}
