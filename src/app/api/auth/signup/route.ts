import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "სახელი სავალდებულოა").max(100),
  email: z.string().email("ელფოსტა არასწორია"),
  password: z.string().min(8, "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო")
});

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  if (adminEmails.length > 0 && !adminEmails.includes(email)) {
    return NextResponse.json({ error: "ამ ელფოსტით რეგისტრაცია აკრძალულია" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "ეს ელფოსტა უკვე გამოყენებულია" }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash
    }
  });

  return NextResponse.json({ ok: true });
}
