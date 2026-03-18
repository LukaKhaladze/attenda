import { notFound } from "next/navigation";
import { AttendeeSignInForm } from "@/components/attendee-signin-form";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AttendeeSignInPage({
  searchParams
}: {
  searchParams: { conferenceId?: string; conferenceSlug?: string };
}) {
  const conference = searchParams.conferenceId
    ? await prisma.conference.findUnique({ where: { id: searchParams.conferenceId } })
    : searchParams.conferenceSlug
      ? await prisma.conference.findUnique({ where: { slug: searchParams.conferenceSlug } })
      : null;

  if (!conference) {
    notFound();
  }

  return (
    <Shell>
      <AttendeeSignInForm conferenceId={conference.id} conferenceTitle={conference.title_ka} />
    </Shell>
  );
}
