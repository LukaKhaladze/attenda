import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    const list = await prisma.conference.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ items: list });
  }

  const item = await prisma.conference.findUnique({ where: { slug } });
  if (!item) {
    return NextResponse.json({ error: "კონფერენცია ვერ მოიძებნა" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const body = await request.json();
  const created = await prisma.conference.create({
    data: {
      slug: body.slug,
      title_ka: body.title_ka,
      description_ka: body.description_ka,
      date: new Date(body.date),
      location_ka: body.location_ka,
      coverImageUrl: body.coverImageUrl || null,
      websiteUrl: body.websiteUrl || null,
      mapUrl: body.mapUrl || null,
      agendaHighlights: body.agendaHighlights || [],
      speakers: body.speakers || []
    }
  });
  return NextResponse.json({ item: created });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const body = await request.json();
  const updated = await prisma.conference.update({
    where: { id: body.id },
    data: {
      slug: body.slug,
      title_ka: body.title_ka,
      description_ka: body.description_ka,
      date: body.date ? new Date(body.date) : undefined,
      location_ka: body.location_ka,
      coverImageUrl: body.coverImageUrl || null,
      websiteUrl: body.websiteUrl || null,
      mapUrl: body.mapUrl || null,
      agendaHighlights: body.agendaHighlights,
      speakers: body.speakers
    }
  });
  return NextResponse.json({ item: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id სავალდებულოა" }, { status: 400 });
  }

  await prisma.conference.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
