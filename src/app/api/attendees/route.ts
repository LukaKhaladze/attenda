import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attendeeQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const search = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = attendeeQuerySchema.safeParse(search);

  if (!parsed.success) {
    return NextResponse.json({ error: "ფილტრი არასწორია" }, { status: 400 });
  }

  const { q, position, hasCompany, hasLinkedin, sort, conferenceId } = parsed.data;

  if (conferenceId) {
    const attendeeId = request.cookies.get("attendee_id")?.value;
    if (!attendeeId) {
      return NextResponse.json({ error: "დამსწრეთა სიის სანახავად ჯერ დარეგისტრირდი ამ ღონისძიებაზე." }, { status: 401 });
    }

    const currentAttendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
      select: {
        conferenceId: true,
        status: true
      }
    });

    if (!currentAttendee || currentAttendee.status !== "APPROVED" || currentAttendee.conferenceId !== conferenceId) {
      return NextResponse.json({ error: "ამ ღონისძიების დამსწრეთა სია მხოლოდ ამავე ღონისძიებაზე დარეგისტრირებულებისთვისაა ხელმისაწვდომი." }, { status: 403 });
    }
  }

  const items = await prisma.attendee.findMany({
    where: {
      status: "APPROVED",
      consentPublicList: true,
      ...(conferenceId ? { conferenceId } : {}),
      ...(position ? { position: { contains: position, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { position: { contains: q, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(hasCompany === "true" ? { company: { not: null } } : {}),
      ...(hasLinkedin === "true" ? { linkedinUrl: { not: "" } } : {})
    },
    orderBy: sort === "az" ? { fullName: "asc" } : { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      company: true,
      position: true,
      photoUrl: true,
      createdAt: true,
      linkedinUrl: true
    },
    take: 120
  });

  const positionsRaw = await prisma.attendee.findMany({
    where: {
      status: "APPROVED",
      consentPublicList: true,
      ...(conferenceId ? { conferenceId } : {}),
      position: { not: null }
    },
    select: { position: true },
    distinct: ["position"]
  });

  const positions = positionsRaw
    .map((item) => item.position?.trim())
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b, "ka"));

  return NextResponse.json({ items, positions });
}
