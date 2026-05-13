import { MeetingOfferStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getCurrentAttendee(attendeeId: string) {
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
    return null;
  }

  const legacySenderContactMatches = [currentAttendee.phone, currentAttendee.linkedinUrl]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  return {
    id: currentAttendee.id,
    legacySenderContactMatches,
    fullName: currentAttendee.fullName
  };
}

export async function GET(request: NextRequest) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  if (!attendeeId) {
    return NextResponse.json({ unread: 0, total: 0 });
  }

  const related = await getCurrentAttendee(attendeeId);
  if (!related) {
    return NextResponse.json({ unread: 0, total: 0 });
  }

  const [receivedCount, sentCount, messageCount] = await Promise.all([
    prisma.meetingOffer.count({
      where: { recipientAttendeeId: attendeeId }
    }),
    prisma.meetingOffer.count({
      where: {
        OR: [
          { senderAttendeeId: related.id },
          ...(related.legacySenderContactMatches.length > 0
            ? [
                {
                  senderAttendeeId: null,
                  senderContact: { in: related.legacySenderContactMatches }
                }
              ]
            : []),
          ...(related.fullName
            ? [
                {
                  senderAttendeeId: null,
                  senderName: related.fullName
                }
              ]
            : [])
        ]
      }
    }),
    prisma.meetingOfferMessage.count({
      where: {
        authorAttendeeId: { not: attendeeId },
        offer: {
          OR: [
            { recipientAttendeeId: attendeeId },
            { senderAttendeeId: attendeeId }
          ]
        }
      }
    })
  ]);

  const total = receivedCount + sentCount + messageCount;

  const seenFor = request.cookies.get("notifications_seen_for")?.value;
  const seenRaw = request.cookies.get("notifications_seen_count")?.value;
  const seenCount = seenFor === attendeeId ? Number(seenRaw || "0") : 0;
  const unread = Math.max(total - (Number.isFinite(seenCount) ? seenCount : 0), 0);

  const response = NextResponse.json({ unread, total });
  response.headers.set("Cache-Control", "private, max-age=10, stale-while-revalidate=30");
  return response;
}
