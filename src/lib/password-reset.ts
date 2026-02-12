import { createHash, randomBytes } from "crypto";

const RESET_TOKEN_PREFIX = "password-reset:";

export function buildResetIdentifier(email: string) {
  return `${RESET_TOKEN_PREFIX}${email.toLowerCase()}`;
}

export function createResetToken() {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendResetEmail(params: { email: string; resetUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_FROM_EMAIL;

  if (!apiKey || !from) {
    console.info("[password-reset] missing RESEND_API_KEY or RESET_FROM_EMAIL");
    console.info(`[password-reset] reset link for ${params.email}: ${params.resetUrl}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: params.email,
      subject: "პაროლის აღდგენა - Attenda.ge",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>პაროლის აღდგენა</h2>
          <p>პაროლის შესაცვლელად დააჭირე ბმულს:</p>
          <p><a href="${params.resetUrl}">${params.resetUrl}</a></p>
          <p>ბმული ვალიდურია 60 წუთი.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`RESET_EMAIL_FAILED:${body}`);
  }
}
