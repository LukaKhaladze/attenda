import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { escapeHtml, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "სახელი სავალდებულოა").max(100),
  email: z.string().email("ელფოსტა არასწორია"),
  password: z.string().min(8, "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო")
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "მონაცემი არასწორია" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

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

  try {
    await sendEmail({
      to: email,
      subject: "ანგარიში შეიქმნა — Attenda.ge",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>Attenda.ge</h2>
          <p>გამარჯობა ${escapeHtml(parsed.data.name)},</p>
          <p>თქვენი ანგარიში წარმატებით შეიქმნა.</p>
          <p><a href="${request.nextUrl.origin}/auth/signin">შესვლა</a></p>
        </div>
      `
    });
  } catch (error) {
    console.error("[signup-email] send failed", error);
  }

  return NextResponse.json({ ok: true });
}
