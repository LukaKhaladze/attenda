import { cookies } from "next/headers";
import { MeetingOfferStatus, Prisma } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { NotificationsReadMarker } from "@/components/notifications-read-marker";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabel: Record<MeetingOfferStatus, string> = {
  PENDING: "მოლოდინში",
  ACCEPTED: "დადასტურებულია",
  DECLINED: "არ არის დაინტერესებული"
};

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

  let receivedOffers: Array<{
    id: string;
    senderAttendeeId: string | null;
    senderName: string;
    senderContact: string | null;
    proposedAt: Date | null;
    note: string | null;
    status: MeetingOfferStatus;
    messages: Array<{
      id: string;
      body: string;
      createdAt: Date;
      author: {
        id: string;
        fullName: string;
      };
    }>;
  }> = [];

  let sentOfferResponses: Array<{
    id: string;
    status: MeetingOfferStatus;
    proposedAt: Date | null;
    createdAt: Date;
    recipient: {
      id: string;
      fullName: string;
      company: string | null;
      position: string | null;
    };
    messages: Array<{
      id: string;
      body: string;
      createdAt: Date;
      author: {
        id: string;
        fullName: string;
      };
    }>;
  }> = [];

  let loadError: string | null = null;

  try {
    const currentAttendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        linkedinUrl: true
      }
    });

    if (!currentAttendee) {
      return (
        <Shell>
          <section className="space-y-3">
            <UIHeader title="შეტყობინებები" backHref="/" />
            <UICard>
              <p className="text-sm text-gray-700">დამსწრის პროფილი ვერ მოიძებნა.</p>
            </UICard>
          </section>
        </Shell>
      );
    }

    const legacySenderContactMatches = [currentAttendee.phone, currentAttendee.linkedinUrl]
      .map((item) => item?.trim())
      .filter((item): item is string => Boolean(item));

    const [received, sent] = await Promise.all([
      prisma.meetingOffer.findMany({
        where: { recipientAttendeeId: attendeeId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          senderAttendeeId: true,
          senderName: true,
          senderContact: true,
          proposedAt: true,
          note: true,
          status: true
          ,
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              body: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  fullName: true
                }
              }
            }
          }
        },
        take: 100
      }),
      prisma.meetingOffer.findMany({
        where: {
          OR: [
            { senderAttendeeId: currentAttendee.id },
            ...(legacySenderContactMatches.length > 0
              ? [
                  {
                    senderAttendeeId: null,
                    senderContact: { in: legacySenderContactMatches }
                  }
                ]
              : [])
            ,
            ...(currentAttendee.fullName
              ? [
                  {
                    senderAttendeeId: null,
                    senderName: currentAttendee.fullName
                  }
                ]
              : [])
          ]
        },
        orderBy: { createdAt: "desc" },
        include: {
          recipient: {
            select: {
              id: true,
              fullName: true,
              company: true,
              position: true
            }
          },
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              body: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  fullName: true
                }
              }
            }
          }
        },
        take: 100
      })
    ]);

    receivedOffers = received;
    sentOfferResponses = sent;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      loadError = "შეტყობინებები დროებით მიუწვდომელია. საჭიროა ბაზის მიგრაციის გაშვება.";
    } else {
      loadError = "შეტყობინებების ჩატვირთვა ვერ მოხერხდა. სცადე მოგვიანებით.";
    }
  }

  return (
    <Shell>
      <section className="space-y-4">
        <NotificationsReadMarker />
        <UIHeader title="შეტყობინებები" backHref="/" />

        {loadError ? (
          <UICard>
            <p className="text-sm text-red-700">{loadError}</p>
          </UICard>
        ) : null}

        {!loadError ? (
          <>
            <UICard className="space-y-3">
              <h2 className="text-base font-semibold text-primary">მიღებული შეთავაზებები</h2>
              {receivedOffers.length === 0 ? (
                <p className="text-sm text-gray-700">ახალი შეხვედრის შეთავაზებები ჯერ არ გაქვს.</p>
              ) : (
                <div className="space-y-3">
                  {receivedOffers.map((offer) => (
                    <article key={offer.id} className="rounded-xl border border-gray-200 p-3">
                      {offer.senderAttendeeId ? (
                        <Link href={`/attendees/${offer.senderAttendeeId}`} className="text-sm font-semibold text-primary hover:underline">
                          {offer.senderName}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">{offer.senderName}</p>
                      )}
                      {offer.senderContact ? <p className="text-sm text-gray-700">კონტაქტი: {offer.senderContact}</p> : null}
                      {offer.proposedAt ? <p className="text-sm text-gray-700">შემოთავაზებული დრო: {format(offer.proposedAt, "yyyy-MM-dd HH:mm")}</p> : null}
                      {offer.note ? <p className="mt-1 text-sm text-gray-700">{offer.note}</p> : null}
                      {offer.messages.length > 0 ? (
                        <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                          {offer.messages.map((message) => (
                            <div key={message.id} className="rounded-md bg-white px-2 py-1">
                              <p className="text-xs font-medium text-gray-800">{message.author.fullName}</p>
                              <p className="text-sm text-gray-700">{message.body}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-2 text-xs text-gray-500">სტატუსი: {statusLabel[offer.status]}</p>

                      {offer.status === MeetingOfferStatus.PENDING ? (
                        <form action={`/api/meeting-offers/${offer.id}`} method="post" className="mt-3 space-y-2">
                          <textarea
                            name="note"
                            rows={2}
                            maxLength={500}
                            placeholder="დაწერე ნოუთი (არასავალდებულო)"
                            className="w-full resize-none rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              name="status"
                              value={MeetingOfferStatus.ACCEPTED}
                              className="rounded-lg bg-primary px-3 py-2 text-sm text-white"
                            >
                              დადასტურება
                            </button>
                            <button
                              type="submit"
                              name="status"
                              value={MeetingOfferStatus.DECLINED}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                            >
                              არ ვარ დაინტერესებული
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form action={`/api/meeting-offers/${offer.id}/messages`} method="post" className="mt-3 space-y-2">
                          <textarea
                            name="body"
                            rows={2}
                            maxLength={500}
                            required
                            placeholder="დაწერე დამატებითი ნოუთი"
                            className="w-full resize-none rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                          <button className="rounded-lg border border-primary px-3 py-2 text-sm text-primary">ნოუთის გაგზავნა</button>
                        </form>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </UICard>

            <UICard className="space-y-3">
              <h2 className="text-base font-semibold text-primary">ჩემს შეთავაზებებზე პასუხები</h2>
              {sentOfferResponses.length === 0 ? (
                <p className="text-sm text-gray-700">ჯერ პასუხი არ მიგიღია შენს გაგზავნილ შეთავაზებებზე.</p>
              ) : (
                <div className="space-y-3">
                  {sentOfferResponses.map((offer) => (
                    <article key={offer.id} className="rounded-xl border border-gray-200 p-3">
                      <p className="text-sm font-semibold text-gray-900">{offer.recipient.fullName}</p>
                      <p className="text-sm text-gray-700">{offer.recipient.position || "პოზიცია არ არის მითითებული"}</p>
                      <p className="text-sm text-gray-700">{offer.recipient.company || "კომპანია არ არის მითითებული"}</p>
                      {offer.proposedAt ? <p className="text-sm text-gray-700">შენ მიერ შეთავაზებული დრო: {format(offer.proposedAt, "yyyy-MM-dd HH:mm")}</p> : null}
                      {offer.messages.length > 0 ? (
                        <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                          {offer.messages.map((message) => (
                            <div key={message.id} className="rounded-md bg-white px-2 py-1">
                              <p className="text-xs font-medium text-gray-800">{message.author.fullName}</p>
                              <p className="text-sm text-gray-700">{message.body}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-2 text-xs text-gray-500">პასუხი: {statusLabel[offer.status]}</p>
                      <form action={`/api/meeting-offers/${offer.id}/messages`} method="post" className="mt-3 space-y-2">
                        <textarea
                          name="body"
                          rows={2}
                          maxLength={500}
                          required
                          placeholder="დაწერე დამატებითი ნოუთი"
                          className="w-full resize-none rounded-md border border-gray-300 px-2 py-1 text-sm"
                        />
                        <button className="rounded-lg border border-primary px-3 py-2 text-sm text-primary">ნოუთის გაგზავნა</button>
                      </form>
                    </article>
                  ))}
                </div>
              )}
            </UICard>
          </>
        ) : null}
      </section>
    </Shell>
  );
}
