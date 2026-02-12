import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createIcsFile } from "@/lib/ics";

export async function GET(request: NextRequest, { params }: { params: { attendeeId: string } }) {
  const attendee = await prisma.attendee.findUnique({
    where: { id: params.attendeeId }
  });

  if (!attendee || attendee.status !== "APPROVED") {
    return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 404 });
  }

  const startsAtRaw = request.nextUrl.searchParams.get("startsAt");
  const durationRaw = request.nextUrl.searchParams.get("durationMinutes");
  const title = request.nextUrl.searchParams.get("title") || `შეხვედრა - ${attendee.fullName}`;
  const notes = request.nextUrl.searchParams.get("notes") || "";

  const startsAt = startsAtRaw ? new Date(startsAtRaw) : new Date(Date.now() + 60 * 60 * 1000);
  const durationMinutes = durationRaw ? Number(durationRaw) : 30;

  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "დრო არასწორია" }, { status: 400 });
  }

  const ics = createIcsFile({
    uid: `${attendee.id}@attenda.ge`,
    title,
    description: `შეხვედრა დამსწრესთან: ${attendee.fullName}\nLinkedIn: ${attendee.linkedinUrl}\n${notes}`,
    startsAt,
    durationMinutes
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=meeting-${attendee.id}.ics`
    }
  });
}
