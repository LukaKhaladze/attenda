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

export async function POST(request: NextRequest) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  if (!attendeeId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const related = await getCurrentAttendee(attendeeId);
  if (!related) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const [receivedCount, sentCount] = await Promise.all([
    prisma.meetingOffer.count({ where: { recipientAttendeeId: attendeeId } }),
    prisma.meetingOffer.count({
      where: {
        status: { not: MeetingOfferStatus.PENDING },
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
    })
  ]);

  const total = receivedCount + sentCount;

  const response = NextResponse.json({ ok: true, total });
  response.cookies.set("notifications_seen_for", attendeeId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  response.cookies.set("notifications_seen_count", String(total), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
