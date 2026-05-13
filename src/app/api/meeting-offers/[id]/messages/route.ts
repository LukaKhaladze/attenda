import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMeetingOfferMessageEmail } from "@/lib/meeting-offer-emails";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";

const schema = z.object({
  body: z.string().min(1, "ნოუთი ცარიელი ვერ იქნება").max(500, "ნოუთი უნდა იყოს მაქსიმუმ 500 სიმბოლო")
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  if (!attendeeId) {
    return NextResponse.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = schema.safeParse({ body: String(formData.get("body") || "") });
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/notifications", request.url), 303);
  }

  const offer = await prisma.meetingOffer.findUnique({
    where: { id: params.id },
    include: {
      recipient: { include: { conference: true } },
      sender: true
    }
  });

  if (!offer) {
    return NextResponse.redirect(new URL("/notifications", request.url), 303);
  }

  const isRecipient = offer.recipientAttendeeId === attendeeId;
  const isSender = offer.senderAttendeeId === attendeeId;
  if (!isRecipient && !isSender) {
    return NextResponse.json({ error: "ამ შეთავაზებაზე წვდომა არ გაქვს" }, { status: 403 });
  }

  const body = cleanText(parsed.data.body).trim();
  if (!body) {
    return NextResponse.redirect(new URL("/notifications", request.url), 303);
  }

  await prisma.meetingOfferMessage.create({
    data: {
      meetingOfferId: offer.id,
      authorAttendeeId: attendeeId,
      body
    }
  });

  const recipientEmail = isRecipient ? offer.sender?.email : offer.recipient.email;
  const recipientName = isRecipient ? offer.sender?.fullName || "დამსწრე" : offer.recipient.fullName;
  const authorName = isRecipient ? offer.recipient.fullName : offer.sender?.fullName || offer.senderName;

  if (recipientEmail) {
    try {
      await sendMeetingOfferMessageEmail({
        to: recipientEmail,
        recipientName,
        authorName,
        conferenceTitle: offer.recipient.conference.title_ka,
        body,
        notificationsUrl: `${request.nextUrl.origin}/notifications`
      });
    } catch (error) {
      console.error("[meeting-offer-message-email] send failed", error);
    }
  }

  return NextResponse.redirect(new URL("/notifications", request.url), 303);
}
