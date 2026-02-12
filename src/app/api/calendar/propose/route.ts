import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCalendarEvent } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { meetingSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Google Calendar-ისთვის საჭიროა ადმინ ავტორიზაცია" }, { status: 401 });
  }

  const body = await request.json();

  const parsed = meetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const attendee = await prisma.attendee.findUnique({ where: { id: parsed.data.attendeeId } });

  if (!attendee || attendee.status !== "APPROVED") {
    return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 404 });
  }

  try {
    const url = await createCalendarEvent({
      userId: session.user.id,
      attendeeName: attendee.fullName,
      attendeeLinkedin: attendee.linkedinUrl,
      title: parsed.data.title,
      startsAt: parsed.data.startsAt,
      durationMinutes: parsed.data.durationMinutes,
      notes: parsed.data.notes
    });

    return NextResponse.json({ ok: true, url });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "GOOGLE_ACCOUNT_MISSING") {
      return NextResponse.json({ error: "Google ავტორიზაცია ვერ მოიძებნა. შედი /admin გვერდზე Google-ით." }, { status: 400 });
    }
    return NextResponse.json({ error: "Google Calendar-ში დამატება ვერ შესრულდა" }, { status: 500 });
  }
}
