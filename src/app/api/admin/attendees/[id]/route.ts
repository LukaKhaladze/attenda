import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendeeStatusSchema } from "@/lib/validation";

async function updateStatus(request: NextRequest, id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "არ გაქვს წვდომა" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  let status: string | null = null;
  if (contentType.includes("application/json")) {
    const body = await request.json();
    status = body.status ?? null;
  } else {
    const formData = await request.formData();
    status = String(formData.get("status") || "");
  }

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
  return updateStatus(request, params.id);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await updateStatus(request, params.id);

  if (request.headers.get("content-type")?.includes("application/x-www-form-urlencoded") || request.headers.get("content-type")?.includes("multipart/form-data")) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  return result;
}
