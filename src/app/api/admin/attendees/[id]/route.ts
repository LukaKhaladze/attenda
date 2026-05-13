import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hasAdminAccess } from "@/lib/admin";
import { sendAttendeeStatusEmail } from "@/lib/attendee-emails";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendeeStatusSchema } from "@/lib/validation";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!hasAdminAccess(session?.user)) {
    return null;
  }

  return session;
}

async function updateStatusByValue(id: string, status: string | null) {
  const parsed = attendeeStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return NextResponse.json({ error: "სტატუსი არასწორია" }, { status: 400 });
  }

  const attendee = await prisma.attendee.findUnique({
    where: { id },
    include: { conference: true }
  });

  if (!attendee) {
    return NextResponse.json({ error: "დამსწრე ვერ მოიძებნა" }, { status: 404 });
  }

  const updatedAttendee = await prisma.attendee.update({
    where: { id },
    data: {
      status: parsed.data.status
    },
    include: { conference: true }
  });

  if (attendee.status !== updatedAttendee.status) {
    try {
      await sendAttendeeStatusEmail({
        email: updatedAttendee.email,
        fullName: updatedAttendee.fullName,
        conferenceTitle: updatedAttendee.conference.title_ka,
        conferenceUrl: updatedAttendee.conference.slug ? `/conference/${updatedAttendee.conference.slug}` : undefined,
        status: updatedAttendee.status
      });
    } catch (error) {
      console.error("[attendee-status-email] send failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  return updateStatusByValue(params.id, body?.status ?? null);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const formData = await request.formData();
  const status = String(formData.get("status") || "");
  const redirectTo = String(formData.get("redirectTo") || "/admin");

  const result = await updateStatusByValue(params.id, status);
  if (!result.ok) {
    return result;
  }

  return NextResponse.redirect(new URL(redirectTo, request.url), 303);
}
