type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

const DEFAULT_FROM_EMAIL = "NetworkApp <no-reply@networkapp.ge>";

function getFromEmail() {
  return process.env.MAIL_FROM_EMAIL || process.env.RESET_FROM_EMAIL || DEFAULT_FROM_EMAIL;
}

export function isEmailEnabled() {
  return Boolean(process.env.RESEND_API_KEY && getFromEmail());
}

export async function sendEmail(params: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getFromEmail();

  if (!apiKey || !from) {
    console.info(`[email] missing RESEND_API_KEY; skipped ${params.subject} to ${String(params.to)}`);
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
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {})
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`EMAIL_FAILED:${body}`);
  }
}

export function escapeHtml(value: string | null | undefined) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
