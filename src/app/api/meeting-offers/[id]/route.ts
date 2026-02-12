import { MeetingOfferStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({
  status: z.enum([MeetingOfferStatus.ACCEPTED, MeetingOfferStatus.DECLINED])
});

async function updateStatus(offerId: string, attendeeId: string, status: MeetingOfferStatus) {
  const offer = await prisma.meetingOffer.findUnique({ where: { id: offerId } });

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

  return updateStatus(params.id, attendeeId, parsed.data.status);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  if (!attendeeId) {
    return NextResponse.redirect(new URL("/register", request.url), 303);
  }

  const formData = await request.formData();
  const parsed = statusSchema.safeParse({ status: String(formData.get("status") || "") });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/notifications", request.url), 303);
  }

  await updateStatus(params.id, attendeeId, parsed.data.status);
  return NextResponse.redirect(new URL("/notifications", request.url), 303);
}
