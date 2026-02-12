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
