import { cookies } from "next/headers";
import { format } from "date-fns";
import { Shell } from "@/components/shell";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const attendeeId = cookies().get("attendee_id")?.value;

  if (!attendeeId) {
    return (
      <Shell>
        <section className="space-y-3">
          <UIHeader title="შეტყობინებები" backHref="/" />
          <UICard>
            <p className="text-sm text-gray-700">შეტყობინებების სანახავად ჯერ დარეგისტრირდი როგორც დამსწრე.</p>
          </UICard>
        </section>
      </Shell>
    );
  }

  const offers = await prisma.meetingOffer.findMany({
    where: { recipientAttendeeId: attendeeId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <Shell>
      <section className="space-y-3">
        <UIHeader title="შეტყობინებები" backHref="/" />

        {offers.length === 0 ? (
          <UICard>
            <p className="text-sm text-gray-700">ახალი შეხვედრის შეთავაზებები ჯერ არ გაქვს.</p>
          </UICard>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <UICard key={offer.id}>
                <p className="text-sm font-semibold text-gray-900">{offer.senderName}</p>
                {offer.senderContact ? <p className="text-sm text-gray-700">კონტაქტი: {offer.senderContact}</p> : null}
                {offer.proposedAt ? <p className="text-sm text-gray-700">შემოთავაზებული დრო: {format(offer.proposedAt, "yyyy-MM-dd HH:mm")}</p> : null}
                {offer.note ? <p className="mt-1 text-sm text-gray-700">{offer.note}</p> : null}
                <p className="mt-2 text-xs text-gray-500">სტატუსი: {offer.status}</p>
              </UICard>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
