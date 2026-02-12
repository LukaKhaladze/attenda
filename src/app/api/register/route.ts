import { NextRequest, NextResponse } from "next/server";
import { AttendeeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { cleanText } from "@/lib/sanitize";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  if (!checkRateLimit(`register:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: "ძალიან ბევრი მოთხოვნა. სცადე მოგვიანებით." }, { status: 429 });
  }

  const body = await request.json();

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "ვალიდაცია ჩავარდა" }, { status: 400 });
  }

  const data = parsed.data;

  if (data.website) {
    return NextResponse.json({ error: "მოთხოვნა დაბლოკილია" }, { status: 400 });
  }

  if (Date.now() - data.formStartedAt < 3000) {
    return NextResponse.json({ error: "ფორმა ძალიან სწრაფად გაიგზავნა" }, { status: 400 });
  }

  const conference = await prisma.conference.findUnique({ where: { id: data.conferenceId } });
  if (!conference) {
    return NextResponse.json({ error: "კონფერენცია ვერ მოიძებნა" }, { status: 404 });
  }

  const attendee = await prisma.attendee.create({
    data: {
      conferenceId: data.conferenceId,
      fullName: cleanText(data.fullName),
      company: cleanText(data.company),
      position: cleanText(data.position),
      phone: cleanText(data.phone),
      linkedinUrl: cleanText(data.linkedinUrl),
      photoUrl: data.photoUrl ? cleanText(data.photoUrl) : null,
      sharePhonePublic: data.sharePhonePublic,
      consentPublicList: data.consentPublicList,
      status: AttendeeStatus.APPROVED
    }
  });

  const response = NextResponse.json({ ok: true, attendeeId: attendee.id });
  response.cookies.set("attendee_id", attendee.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90
  });

  return response;
}
