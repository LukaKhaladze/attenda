import { MeetingOfferStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getRelatedAttendee(attendeeId: string) {
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

  const relatedAttendeeIds = await prisma.attendee.findMany({
    where: {
      OR: [
        { id: currentAttendee.id },
        ...(currentAttendee.phone ? [{ phone: currentAttendee.phone }] : []),
        ...(currentAttendee.linkedinUrl ? [{ linkedinUrl: currentAttendee.linkedinUrl }] : []),
        ...(currentAttendee.fullName ? [{ fullName: currentAttendee.fullName }] : [])
      ]
    },
    select: { id: true }
  });

  return {
    senderIds: Array.from(new Set(relatedAttendeeIds.map((item) => item.id))),
    legacySenderContactMatches,
    fullName: currentAttendee.fullName
  };
}

export async function GET(request: NextRequest) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  if (!attendeeId) {
    return NextResponse.json({ unread: 0, total: 0 });
  }

  const related = await getRelatedAttendee(attendeeId);
  if (!related) {
    return NextResponse.json({ unread: 0, total: 0 });
  }

  const [receivedCount, sentCount] = await Promise.all([
    prisma.meetingOffer.count({
      where: { recipientAttendeeId: attendeeId }
    }),
    prisma.meetingOffer.count({
      where: {
        status: { not: MeetingOfferStatus.PENDING },
        OR: [
          { senderAttendeeId: { in: related.senderIds } },
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
    })
  ]);

  const total = receivedCount + sentCount;

  const seenFor = request.cookies.get("notifications_seen_for")?.value;
  const seenRaw = request.cookies.get("notifications_seen_count")?.value;
  const seenCount = seenFor === attendeeId ? Number(seenRaw || "0") : 0;
  const unread = Math.max(total - (Number.isFinite(seenCount) ? seenCount : 0), 0);

  return NextResponse.json({ unread, total });
}
