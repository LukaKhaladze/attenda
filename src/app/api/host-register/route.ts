import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";
import { hostRegisterSchema } from "@/lib/validation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = hostRegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const data = parsed.data;
  const slugBase = slugify(data.title_ka) || "conference";
  const slug = `${slugBase}-${randomUUID().slice(0, 6)}`;

  const conference = await prisma.conference.create({
    data: {
      slug,
      title_ka: cleanText(data.title_ka),
      description_ka: `${cleanText(data.description_ka)}\n\nორგანიზატორი: ${cleanText(data.organizerName)} (${cleanText(data.organizerCompany)})\nელფოსტა: ${cleanText(data.organizerEmail)}\nტელეფონი: ${cleanText(data.organizerPhone)}`,
      date: new Date(data.date),
      location_ka: cleanText(data.location_ka),
      websiteUrl: data.websiteUrl ? cleanText(data.websiteUrl) : null,
      mapUrl: data.mapUrl ? cleanText(data.mapUrl) : null,
      coverImageUrl: data.coverImageUrl ? cleanText(data.coverImageUrl) : null,
      agendaHighlights: ["ქსელური გაცნობა", "ექსპერტული სესიები", "პარტნიორობის შესაძლებლობები"]
    }
  });

  return NextResponse.json({ ok: true, conferenceId: conference.id });
}
