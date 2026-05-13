import { NextResponse } from "next/server";
import { stringify } from "csv-stringify/sync";
import { getServerSession } from "next-auth";
import { hasAdminAccess } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!hasAdminAccess(session?.user)) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conferenceId = searchParams.get("conferenceId");

  const attendees = await prisma.attendee.findMany({
    where: conferenceId ? { conferenceId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      conference: true
    }
  });

  const csv = stringify(
    attendees.map((a) => ({
      id: a.id,
      conference: a.conference.title_ka,
      fullName: a.fullName,
      email: a.email || "",
      company: a.company || "",
      position: a.position || "",
      phone: a.phone,
      linkedinUrl: a.linkedinUrl,
      sharePhonePublic: a.sharePhonePublic,
      consentPublicList: a.consentPublicList,
      status: a.status,
      createdAt: a.createdAt.toISOString()
    })),
    {
      header: true
    }
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${conferenceId ? "conference-attendees.csv" : "attendees.csv"}`
    }
  });
}
