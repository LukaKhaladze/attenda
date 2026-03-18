import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const attendeeId = request.cookies.get("attendee_id")?.value;
  const conferenceId = request.nextUrl.searchParams.get("conferenceId");
  const conferenceSlug = request.nextUrl.searchParams.get("conferenceSlug");

  if (!attendeeId) {
    return NextResponse.json({ isAttendee: false, hasConferenceAccess: false });
  }

  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
    select: {
      id: true,
      conferenceId: true,
      status: true,
      conference: {
        select: {
          slug: true
        }
      }
    }
  });

  if (!attendee || attendee.status !== "APPROVED") {
    const response = NextResponse.json({ isAttendee: false, hasConferenceAccess: false });
    response.cookies.set("attendee_id", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0
    });
    return response;
  }

  const hasConferenceAccess =
    !conferenceId && !conferenceSlug
      ? true
      : conferenceId
        ? attendee.conferenceId === conferenceId
        : attendee.conference?.slug === conferenceSlug;

  const response = NextResponse.json({
    isAttendee: true,
    hasConferenceAccess,
    conferenceId: attendee.conferenceId
  });
  response.headers.set("Cache-Control", "private, max-age=15, stale-while-revalidate=45");
  return response;
}
