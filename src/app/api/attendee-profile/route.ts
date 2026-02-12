import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";
import { attendeeProfileUpdateSchema } from "@/lib/validation";

export async function GET() {
  const attendeeId = cookies().get("attendee_id")?.value;

  if (!attendeeId) {
    return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 401 });
  }

  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
    select: {
      id: true,
      fullName: true,
      company: true,
      position: true,
      motivation: true,
      phone: true,
      linkedinUrl: true,
      photoUrl: true,
      sharePhonePublic: true,
      consentPublicList: true
    }
  });

  if (!attendee) {
    return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 404 });
  }

  return NextResponse.json({ item: attendee });
}

export async function PATCH(request: NextRequest) {
  const attendeeId = cookies().get("attendee_id")?.value;

  if (!attendeeId) {
    return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = attendeeProfileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const data = parsed.data;

  const attendee = await prisma.attendee.update({
    where: { id: attendeeId },
    data: {
      fullName: cleanText(data.fullName),
      company: data.company ? cleanText(data.company) : null,
      position: data.position ? cleanText(data.position) : null,
      motivation: data.motivation ? cleanText(data.motivation) : null,
      phone: data.phone ? cleanText(data.phone) : "",
      linkedinUrl: data.linkedinUrl ? cleanText(data.linkedinUrl) : "",
      photoUrl: data.photoUrl ? cleanText(data.photoUrl) : null,
      sharePhonePublic: Boolean(data.phone) && data.sharePhonePublic,
      consentPublicList: data.consentPublicList
    },
    select: {
      id: true
    }
  });

  return NextResponse.json({ ok: true, id: attendee.id });
}
