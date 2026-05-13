import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { sendMeetingOfferCreatedEmail } from "@/lib/meeting-offer-emails";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";

const schema = z.object({
  recipientAttendeeId: z.string().cuid(),
  proposedAt: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "შეხვედრის დრო არასწორია"),
  note: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
    }

    const data = parsed.data;
    const senderAttendeeId = request.cookies.get("attendee_id")?.value;

    if (!senderAttendeeId) {
      return NextResponse.json({ error: "შეთავაზების გასაგზავნად საჭიროა დამსწრედ ავტორიზაცია" }, { status: 401 });
    }

    const senderAttendee = await prisma.attendee.findUnique({
      where: { id: senderAttendeeId },
      include: { conference: true }
    });
    if (!senderAttendee || senderAttendee.status !== "APPROVED") {
      return NextResponse.json({ error: "გამომგზავნის პროფილი ვერ მოიძებნა" }, { status: 401 });
    }

    if (senderAttendeeId === data.recipientAttendeeId) {
      return NextResponse.json({ error: "საკუთარ თავთან შეხვედრის შეთავაზება არ შეიძლება" }, { status: 400 });
    }

    const attendee = await prisma.attendee.findUnique({ where: { id: data.recipientAttendeeId } });
    if (!attendee || attendee.status !== "APPROVED") {
      return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 404 });
    }

    if (senderAttendee.conferenceId !== attendee.conferenceId) {
      return NextResponse.json({ error: "შეხვედრის შეთავაზება შესაძლებელია მხოლოდ იმავე ღონისძიების დამსწრეებს შორის." }, { status: 403 });
    }

    const note = data.note ? cleanText(data.note) : null;

    await prisma.meetingOffer.create({
      data: {
        recipientAttendeeId: data.recipientAttendeeId,
        senderAttendeeId,
        senderName: cleanText(senderAttendee.fullName),
        senderContact: senderAttendee.phone ? cleanText(senderAttendee.phone) : null,
        proposedAt: data.proposedAt ? new Date(data.proposedAt) : null,
        note
      }
    });

    try {
      await sendMeetingOfferCreatedEmail({
        to: attendee.email,
        recipientName: attendee.fullName,
        senderName: senderAttendee.fullName,
        conferenceTitle: senderAttendee.conference.title_ka,
        notificationsUrl: `${request.nextUrl.origin}/notifications`,
        note
      });
    } catch (error) {
      console.error("[meeting-offer-email] send failed", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "შეხვედრის ცხრილი ვერ მოიძებნა. გაუშვი მიგრაცია (prisma migrate deploy)." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "შეთავაზება დროებით ვერ გაიგზავნა. სცადე მოგვიანებით." }, { status: 500 });
  }
}
