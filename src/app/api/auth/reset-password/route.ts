import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildResetIdentifier, hashResetToken } from "@/lib/password-reset";

const schema = z.object({
  email: z.string().email("ელფოსტა არასწორია"),
  token: z.string().min(20, "ბმული არასწორია"),
  password: z.string().min(8, "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო")
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const identifier = buildResetIdentifier(email);
  const tokenHash = hashResetToken(parsed.data.token);

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier,
        token: tokenHash
      }
    }
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json({ error: "ბმული ვადაგასულია ან არასწორია" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "მომხმარებელი ვერ მოიძებნა" }, { status: 404 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier }
    })
  ]);

  return NextResponse.json({ ok: true });
}
