import { MeetingOfferStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Shell } from "@/components/shell";
import { hasAdminAccess } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!hasAdminAccess(session.user)) {
    redirect("/");
  }

  const offerStats = await prisma.meetingOffer.groupBy({
    by: ["status"],
    _count: { _all: true }
  });

  const offerStatsMap = new Map(offerStats.map((item) => [item.status, item._count._all]));
  const totalOffersSent = offerStats.reduce((sum, item) => sum + item._count._all, 0);
  const approvedOffers = offerStatsMap.get(MeetingOfferStatus.ACCEPTED) ?? 0;
  const rejectedOffers = offerStatsMap.get(MeetingOfferStatus.DECLINED) ?? 0;
  const pendingOffers = offerStatsMap.get(MeetingOfferStatus.PENDING) ?? 0;

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-brand-900">Meeting Offer Analytics</h1>
            <p className="text-sm text-brand-700">შეხვედრის შეთავაზებების სრული სტატისტიკა</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800">
              უკან
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_14px_30px_rgba(49,115,241,0.06)]">
            <p className="text-sm text-brand-700">Sent Offers</p>
            <p className="text-3xl font-bold text-brand-900">{totalOffersSent}</p>
          </article>
          <article className="rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_14px_30px_rgba(49,115,241,0.06)]">
            <p className="text-sm text-brand-700">Approved</p>
            <p className="text-3xl font-bold text-emerald-700">{approvedOffers}</p>
          </article>
          <article className="rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_14px_30px_rgba(49,115,241,0.06)]">
            <p className="text-sm text-brand-700">Rejected</p>
            <p className="text-3xl font-bold text-red-700">{rejectedOffers}</p>
          </article>
          <article className="rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_14px_30px_rgba(49,115,241,0.06)]">
            <p className="text-sm text-brand-700">Pending</p>
            <p className="text-3xl font-bold text-amber-700">{pendingOffers}</p>
          </article>
        </div>
      </section>
    </Shell>
  );
}
