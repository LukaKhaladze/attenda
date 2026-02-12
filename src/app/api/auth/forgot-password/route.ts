import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildResetIdentifier, createResetToken, hashResetToken, sendResetEmail } from "@/lib/password-reset";

const schema = z.object({
  email: z.string().email("ელფოსტა არასწორია")
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = createResetToken();
    const tokenHash = hashResetToken(token);
    const identifier = buildResetIdentifier(email);

    await prisma.verificationToken.deleteMany({
      where: {
        identifier
      }
    });

    await prisma.verificationToken.create({
      data: {
        identifier,
        token: tokenHash,
        expires: addHours(new Date(), 1)
      }
    });

    const resetUrl = `${request.nextUrl.origin}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    await sendResetEmail({ email, resetUrl });
  }

  return NextResponse.json({ ok: true, message: "თუ ელფოსტა არსებობს, პაროლის აღდგენის ბმული გამოგზავნილია." });
}
