import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80";

function parseDataImage(value: string) {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }
  return { mime: match[1], base64: match[2] };
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const conference = await prisma.conference.findUnique({
    where: { slug: params.slug },
    select: { coverImageUrl: true }
  });

  const cover = conference?.coverImageUrl?.trim();
  if (!cover) {
    return NextResponse.redirect(FALLBACK_IMAGE, 302);
  }

  if (cover.startsWith("data:image/")) {
    const parsed = parseDataImage(cover);
    if (!parsed) {
      return NextResponse.redirect(FALLBACK_IMAGE, 302);
    }
    const bytes = Buffer.from(parsed.base64, "base64");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": parsed.mime,
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  }

  return NextResponse.redirect(cover, 302);
}
