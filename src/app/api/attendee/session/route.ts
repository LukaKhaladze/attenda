import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const attendeeId = request.cookies.get("attendee_id")?.value;

  if (!attendeeId) {
    return NextResponse.json({ isAttendee: false });
  }

  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
    select: { id: true }
  });

  return NextResponse.json({ isAttendee: Boolean(attendee) });
}
