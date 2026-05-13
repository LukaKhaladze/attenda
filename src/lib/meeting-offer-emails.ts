import { escapeHtml, sendEmail } from "@/lib/email";

type OfferEmailParams = {
  to?: string | null;
  recipientName: string;
  senderName: string;
  conferenceTitle: string;
  notificationsUrl?: string;
  note?: string | null;
};

function buildNotificationsUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("/")) {
    return `${process.env.NEXTAUTH_URL || ""}${url}`;
  }

  return url;
}

function renderAction(url?: string) {
  const href = buildNotificationsUrl(url);
  if (!href) {
    return "";
  }

  return `<p><a href="${escapeHtml(href)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;">შეტყობინებების ნახვა</a></p>`;
}

export async function sendMeetingOfferCreatedEmail(params: OfferEmailParams) {
  if (!params.to) {
    return;
  }

  const notificationsUrl = buildNotificationsUrl(params.notificationsUrl);
  await sendEmail({
    to: params.to,
    subject: `ახალი შეხვედრის შეთავაზება — ${params.conferenceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>ახალი შეხვედრის შეთავაზება</h2>
        <p>გამარჯობა ${escapeHtml(params.recipientName)},</p>
        <p><strong>${escapeHtml(params.senderName)}</strong>-მა გამოგიგზავნა შეხვედრის შეთავაზება.</p>
        ${params.note ? `<p><strong>შენიშვნა:</strong> ${escapeHtml(params.note)}</p>` : ""}
        <p><strong>ღონისძიება:</strong> ${escapeHtml(params.conferenceTitle)}</p>
        <p>შეტყობინება ასევე გამოჩნდა თქვენს პირად გვერდზე.</p>
        ${notificationsUrl ? `<p><a href="${escapeHtml(notificationsUrl)}">${escapeHtml(notificationsUrl)}</a></p>` : ""}
        ${renderAction(params.notificationsUrl)}
      </div>
    `
  });
}

export async function sendMeetingOfferStatusEmail(params: {
  to?: string | null;
  senderName: string;
  recipientName: string;
  conferenceTitle: string;
  status: "ACCEPTED" | "DECLINED";
  notificationsUrl?: string;
}) {
  if (!params.to) {
    return;
  }

  const statusText = params.status === "ACCEPTED" ? "დადასტურდა" : "უარყოფილია";

  await sendEmail({
    to: params.to,
    subject: `შეხვედრის შეთავაზება ${statusText} — ${params.conferenceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>შეთავაზების სტატუსი განახლდა</h2>
        <p>გამარჯობა ${escapeHtml(params.senderName)},</p>
        <p><strong>${escapeHtml(params.recipientName)}</strong>-მა თქვენი შეთავაზება მონიშნა როგორც: <strong>${escapeHtml(statusText)}</strong>.</p>
        <p><strong>ღონისძიება:</strong> ${escapeHtml(params.conferenceTitle)}</p>
        ${renderAction(params.notificationsUrl)}
      </div>
    `
  });
}

export async function sendMeetingOfferMessageEmail(params: {
  to?: string | null;
  recipientName: string;
  authorName: string;
  conferenceTitle: string;
  body: string;
  notificationsUrl?: string;
}) {
  if (!params.to) {
    return;
  }

  const notificationsUrl = buildNotificationsUrl(params.notificationsUrl);

  await sendEmail({
    to: params.to,
    subject: `ახალი ნოუთი შეხვედრის შეთავაზებაზე — ${params.conferenceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>ახალი ნოუთი შეთავაზებაზე</h2>
        <p>გამარჯობა ${escapeHtml(params.recipientName)},</p>
        <p><strong>${escapeHtml(params.authorName)}</strong>-მა დაგიტოვა ნოუთი შეთავაზებაზე:</p>
        <p style="background:#f3f4f6;padding:12px;border-radius:8px;">${escapeHtml(params.body)}</p>
        <p><strong>ღონისძიება:</strong> ${escapeHtml(params.conferenceTitle)}</p>
        ${notificationsUrl ? `<p><a href="${escapeHtml(notificationsUrl)}">${escapeHtml(notificationsUrl)}</a></p>` : ""}
        ${renderAction(params.notificationsUrl)}
      </div>
    `
  });
}
