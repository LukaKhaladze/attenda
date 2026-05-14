import Link from "next/link";
import { MeetingOfferStatus } from "@prisma/client";
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

  if (hasAdminAccess(sessionUser) && sessionUser.role === "ADMIN") {
    redirect("/admin");
  }

  if (!hasHostAccess(sessionUser) && !hasAdminAccess(sessionUser)) {
    redirect("/");
  }

  const conferences = await prisma.hostConference.findMany({
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
  const conferenceIds = conferences.map((conference) => conference.id);
  const offerStats = conferenceIds.length
    ? await prisma.meetingOffer.groupBy({
        by: ["status"],
        where: {
          recipient: {
            conferenceId: {
              in: conferenceIds
            }
          }
        },
        _count: {
          _all: true
        }
      })
    : [];
  const offerStatsMap = new Map(offerStats.map((item) => [item.status, item._count._all]));
  const totalOffersSent = offerStats.reduce((sum, item) => sum + item._count._all, 0);
  const approvedOffers = offerStatsMap.get(MeetingOfferStatus.ACCEPTED) ?? 0;
  const rejectedOffers = offerStatsMap.get(MeetingOfferStatus.DECLINED) ?? 0;

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="rounded-3xl border border-[#cfeeed] bg-[linear-gradient(135deg,#edfdfc_0%,#def9f7_100%)] p-5 shadow-[0_18px_40px_rgba(90,226,232,0.12)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#5ae2e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0b1733]">
              HOST
            </span>
            <p className="text-sm font-medium text-[#145965]">
              შენ შესული ხარ როგორც ღონისძიების ჰოსტი
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#3e737d]">
            აქედან ხედავ შენზე მინიჭებულ კონფერენციებს და მართავ მხოლოდ მათ რეგისტრაციებს.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-brand-900">ჰოსტის პანელი</h1>
            <p className="text-sm text-brand-700">აქ ხედავ მხოლოდ შენზე მინიჭებულ კონფერენციებს და მათ რეგისტრაციებს.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/host/analytics" className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800 hover:bg-brand-50">
              Analytics
            </Link>
            <AdminLogoutButton callbackUrl="/host/signin" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#cfeeed] bg-white p-4 shadow-[0_14px_30px_rgba(90,226,232,0.08)]">
            <p className="text-sm text-brand-700">Meeting offers (გაგზავნილი)</p>
            <p className="text-3xl font-bold text-brand-900">{totalOffersSent}</p>
            <p className="mt-2 text-xs leading-5 text-brand-600">მინიჭებული კონფერენციების ჯამური შეთავაზებები.</p>
          </article>
          <article className="rounded-2xl border border-[#cfeeed] bg-white p-4 shadow-[0_14px_30px_rgba(90,226,232,0.08)]">
            <p className="text-sm text-brand-700">Meeting offers (დადასტურებული)</p>
            <p className="text-3xl font-bold text-emerald-700">{approvedOffers}</p>
            <p className="mt-2 text-xs leading-5 text-brand-600">რამდენ შეთავაზებაზე მოვიდა თანხმობა.</p>
          </article>
          <article className="rounded-2xl border border-[#cfeeed] bg-white p-4 shadow-[0_14px_30px_rgba(90,226,232,0.08)]">
            <p className="text-sm text-brand-700">Meeting offers (უარყოფილი)</p>
            <p className="text-3xl font-bold text-red-700">{rejectedOffers}</p>
            <p className="mt-2 text-xs leading-5 text-brand-600">რამდენ შეთავაზებაზე მოვიდა უარყოფა.</p>
          </article>
        </div>

        <div className="rounded-2xl border border-[#cfeeed] bg-white p-5 shadow-[0_18px_40px_rgba(90,226,232,0.08)]">
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
