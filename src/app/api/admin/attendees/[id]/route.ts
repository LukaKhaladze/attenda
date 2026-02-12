import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdminEmail } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendeeStatusSchema } from "@/lib/validation";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }

  return session;
}

async function updateStatusByValue(id: string, status: string | null) {
  const parsed = attendeeStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return NextResponse.json({ error: "სტატუსი არასწორია" }, { status: 400 });
  }

  await prisma.attendee.update({
    where: { id },
    data: {
      status: parsed.data.status
    }
  });

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
