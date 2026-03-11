import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendeeStatusSchema } from "@/lib/validation";

async function ensureHostConferenceAccess(attendeeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
    select: { id: true, conferenceId: true }
  });

  if (!attendee) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true }
  });

  if (!user) {
    return null;
  }

  if (user.role === "ADMIN") {
    return attendee;
  }

  if (user.role !== "HOST") {
    return null;
  }

  const assignment = await prisma.hostConference.findFirst({
    where: {
      conferenceId: attendee.conferenceId,
      userId: user.id
    },
    select: { id: true }
  });

  return assignment ? attendee : null;
}

async function updateStatusByValue(id: string, status: string | null) {
  const parsed = attendeeStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return NextResponse.json({ error: "სტატუსი არასწორია" }, { status: 400 });
  }

  await prisma.attendee.update({
    where: { id },
    data: { status: parsed.data.status }
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const attendee = await ensureHostConferenceAccess(params.id);
  if (!attendee) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const formData = await request.formData();
  const status = String(formData.get("status") || "");
  const redirectTo = String(formData.get("redirectTo") || `/host/conferences/${attendee.conferenceId}`);

  const result = await updateStatusByValue(params.id, status);
  if (!result.ok) {
    return result;
  }

  return NextResponse.redirect(new URL(redirectTo, request.url), 303);
}
