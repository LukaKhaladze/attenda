import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";

const schema = z.object({
  recipientAttendeeId: z.string().cuid(),
  senderName: z.string().min(2).max(100),
  senderContact: z.string().max(120).optional(),
  proposedAt: z.string().optional(),
  note: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const data = parsed.data;

  const attendee = await prisma.attendee.findUnique({ where: { id: data.recipientAttendeeId } });
  if (!attendee || attendee.status !== "APPROVED") {
    return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 404 });
  }

  await prisma.meetingOffer.create({
    data: {
      recipientAttendeeId: data.recipientAttendeeId,
      senderName: cleanText(data.senderName),
      senderContact: data.senderContact ? cleanText(data.senderContact) : null,
      proposedAt: data.proposedAt ? new Date(data.proposedAt) : null,
      note: data.note ? cleanText(data.note) : null
    }
  });

  return NextResponse.json({ ok: true });
}
