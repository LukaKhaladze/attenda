import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { HostSignInForm } from "@/components/host-signin-form";
import { Shell } from "@/components/shell";
import { hasAdminAccess, hasHostAccess } from "@/lib/admin";
import { getCurrentSessionUser } from "@/lib/host";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HostDashboardPage() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    return (
      <Shell>
        <HostSignInForm />
      </Shell>
    );
  }

  if (!hasHostAccess(sessionUser) && !hasAdminAccess(sessionUser)) {
    redirect("/");
  }

  const conferences = hasAdminAccess(sessionUser)
    ? await prisma.conference.findMany({
        orderBy: { date: "asc" },
        include: {
          _count: {
            select: { attendees: true }
          }
        }
      })
    : await prisma.hostConference.findMany({
        where: { userId: sessionUser.id },
        orderBy: { conference: { date: "asc" } },
        include: {
          conference: {
            include: {
              _count: {
                select: { attendees: true }
              }
            }
          }
        }
      }).then((items) => items.map((item) => item.conference));

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-brand-900">ჰოსტის პანელი</h1>
            <p className="text-sm text-brand-700">აქ ხედავ მხოლოდ შენზე მინიჭებულ კონფერენციებს და მათ რეგისტრაციებს.</p>
          </div>
          <AdminLogoutButton callbackUrl="/host/signin" />
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-xl font-semibold text-brand-900">ჩემი კონფერენციები</h2>
          {conferences.length === 0 ? (
            <p className="rounded-lg border border-dashed border-brand-200 p-4 text-sm text-brand-700">
              ამ ანგარიშზე კონფერენცია ჯერ არ არის მინიჭებული.
            </p>
          ) : (
            <div className="grid gap-3">
              {conferences.map((conference) => (
                <Link
                  key={conference.id}
                  href={`/host/conferences/${conference.id}`}
                  className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 transition hover:border-brand-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-brand-900">{conference.title_ka}</p>
                      <p className="mt-1 text-sm text-brand-700">{conference.location_ka}</p>
                    </div>
                    <div className="text-right text-sm text-brand-700">
                      <p>{conference.date.toISOString().slice(0, 16).replace("T", " ")}</p>
                      <p>რეგისტრაცია: {conference._count.attendees}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
