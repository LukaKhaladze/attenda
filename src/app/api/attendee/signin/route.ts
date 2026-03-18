import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  conferenceId: z.string().cuid("კონფერენციის იდენტიფიკატორი არასწორია"),
  fullName: z.string().min(2, "სახელი სავალდებულოა").max(120),
  position: z.string().min(2, "პოზიცია სავალდებულოა").max(120)
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const attendee = await prisma.attendee.findFirst({
    where: {
      conferenceId: parsed.data.conferenceId,
      fullName: { equals: parsed.data.fullName.trim(), mode: "insensitive" },
      position: { equals: parsed.data.position.trim(), mode: "insensitive" }
    }
  });

  if (!attendee) {
    return NextResponse.json({ error: "ამ მონაცემებით დამსწრე ვერ მოიძებნა ამ ღონისძიებაზე." }, { status: 404 });
  }

  if (attendee.status !== "APPROVED") {
    return NextResponse.json({ error: "თქვენი რეგისტრაცია ჯერ არ არის დადასტურებული." }, { status: 403 });
  }

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
