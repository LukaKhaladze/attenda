import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SALES_EMAIL = "khaladze27@gmail.com";

const leadSchema = z.object({
  name: z.string().trim().min(1, "სახელი სავალდებულოა"),
  email: z.string().trim().email("ელფოსტა არასწორია"),
  phone: z.string().trim().min(1, "ტელეფონი სავალდებულოა")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "ფორმა არასწორია" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.LEADS_FROM_EMAIL || process.env.RESET_FROM_EMAIL;

    if (!apiKey || !from) {
      console.info("[contact-lead] missing RESEND_API_KEY or sender email");
      return NextResponse.json(
        { error: "ელფოსტის გაგზავნა ახლა მიუწვდომელია. სცადე მოგვიანებით." },
        { status: 500 }
      );
    }

    const { name, email, phone } = parsed.data;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: SALES_EMAIL,
        reply_to: email,
        subject: `ახალი ლიდი Networkapp-დან — ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h2>ახალი მოთხოვნა საიტიდან</h2>
            <p><strong>სახელი:</strong> ${name}</p>
            <p><strong>ელფოსტა:</strong> ${email}</p>
            <p><strong>ტელეფონი:</strong> ${phone}</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[contact-lead] resend failed", errorBody);
      return NextResponse.json(
        { error: "ელფოსტის გაგზავნა ვერ მოხერხდა. სცადე თავიდან." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact-lead] unexpected error", error);
    return NextResponse.json({ error: "ფორმის გაგზავნა ვერ მოხერხდა. სცადე თავიდან." }, { status: 500 });
  }
}
