import { MeetingOfferStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMeetingOfferMessageEmail, sendMeetingOfferStatusEmail } from "@/lib/meeting-offer-emails";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";

const statusSchema = z.object({
  status: z.enum([MeetingOfferStatus.ACCEPTED, MeetingOfferStatus.DECLINED]),
  note: z.string().max(500).optional()
});

async function updateStatus(offerId: string, attendeeId: string, status: MeetingOfferStatus, note?: string) {
  const offer = await prisma.meetingOffer.findUnique({
    where: { id: offerId },
    include: {
      recipient: {
        include: { conference: true }
      },
      sender: true
    }
  });

  if (!offer) {
    return NextResponse.json({ error: "შეთავაზება ვერ მოიძებნა" }, { status: 404 });
  }

  if (offer.recipientAttendeeId !== attendeeId) {
    return NextResponse.json({ error: "ამ შეთავაზებაზე წვდომა არ გაქვს" }, { status: 403 });
  }

  await prisma.meetingOffer.update({
    where: { id: offerId },
    data: { status }
  });

  const cleanNote = note ? cleanText(note).trim() : "";
  if (cleanNote) {
    await prisma.meetingOfferMessage.create({
      data: {
        meetingOfferId: offer.id,
        authorAttendeeId: attendeeId,
        body: cleanNote
      }
    });
  }

  if (offer.sender?.email) {
    try {
      if (cleanNote) {
        await sendMeetingOfferMessageEmail({
          to: offer.sender.email,
          recipientName: offer.sender.fullName,
          authorName: offer.recipient.fullName,
          conferenceTitle: offer.recipient.conference.title_ka,
          body: cleanNote,
          notificationsUrl: "/notifications"
        });
      }
      await sendMeetingOfferStatusEmail({
        to: offer.sender.email,
        senderName: offer.sender.fullName,
        recipientName: offer.recipient.fullName,
        conferenceTitle: offer.recipient.conference.title_ka,
        status: status === MeetingOfferStatus.ACCEPTED ? "ACCEPTED" : "DECLINED",
        notificationsUrl: "/notifications"
      });
    } catch (error) {
      console.error("[meeting-offer-status-email] send failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  if (!attendeeId) {
    return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "სტატუსი არასწორია" }, { status: 400 });
  }

  return updateStatus(params.id, attendeeId, parsed.data.status, parsed.data.note);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  if (!attendeeId) {
    return NextResponse.redirect(new URL("/register", request.url), 303);
  }

  const formData = await request.formData();
  const parsed = statusSchema.safeParse({
    status: String(formData.get("status") || ""),
    note: String(formData.get("note") || "")
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/notifications", request.url), 303);
  }

  await updateStatus(params.id, attendeeId, parsed.data.status, parsed.data.note);
  return NextResponse.redirect(new URL("/notifications", request.url), 303);
}
