import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const attendeeId = request.cookies.get("attendee_id")?.value;

  if (!attendeeId) {
    return NextResponse.json({ isAttendee: false });
  }

  const response = NextResponse.json({ isAttendee: true });
  response.headers.set("Cache-Control", "private, max-age=15, stale-while-revalidate=45");
  return response;
}
