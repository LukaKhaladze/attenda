import { AttendeeStatus } from "@prisma/client";
import { escapeHtml, sendEmail } from "@/lib/email";

type AttendeeEmailParams = {
  email?: string | null;
  fullName: string;
  conferenceTitle: string;
  conferenceUrl?: string;
};

const statusSubjects: Record<AttendeeStatus, string> = {
  APPROVED: "რეგისტრაცია დადასტურებულია",
  HIDDEN: "რეგისტრაციის სტატუსი განახლდა",
  PENDING: "რეგისტრაცია მოლოდინშია"
};

const statusMessages: Record<AttendeeStatus, string> = {
  APPROVED: "თქვენი რეგისტრაცია დადასტურდა. უკვე შეგიძლიათ შეხვიდეთ დამსწრეთა სიაში და დაგეგმოთ შეხვედრები.",
  HIDDEN: "თქვენი რეგისტრაცია ამ ეტაპზე დამსწრეთა საჯარო სიაში არ გამოჩნდება.",
  PENDING: "თქვენი რეგისტრაცია მიღებულია და ელოდება ორგანიზატორის დადასტურებას."
};

function attendeeHtml(params: AttendeeEmailParams, message: string) {
  const safeName = escapeHtml(params.fullName);
  const safeConference = escapeHtml(params.conferenceTitle);
  const conferenceUrl =
    params.conferenceUrl && params.conferenceUrl.startsWith("/")
      ? `${process.env.NEXTAUTH_URL || ""}${params.conferenceUrl}`
      : params.conferenceUrl;
  const action = conferenceUrl
    ? `<p><a href="${escapeHtml(conferenceUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;">ღონისძიების ნახვა</a></p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2>Attenda.ge</h2>
      <p>გამარჯობა ${safeName},</p>
      <p>${escapeHtml(message)}</p>
      <p><strong>ღონისძიება:</strong> ${safeConference}</p>
      ${action}
    </div>
  `;
}

export async function sendAttendeeRegistrationReceivedEmail(params: AttendeeEmailParams) {
  if (!params.email) {
    return;
  }

  await sendEmail({
    to: params.email,
    subject: `რეგისტრაცია მიღებულია — ${params.conferenceTitle}`,
    html: attendeeHtml(params, statusMessages.PENDING)
  });
}

export async function sendAttendeeStatusEmail(params: AttendeeEmailParams & { status: AttendeeStatus }) {
  if (!params.email) {
    return;
  }

  await sendEmail({
    to: params.email,
    subject: `${statusSubjects[params.status]} — ${params.conferenceTitle}`,
    html: attendeeHtml(params, statusMessages[params.status])
  });
}

export async function notifyHostsAboutRegistration(
  params: AttendeeEmailParams & { adminUrl?: string; hostEmails?: Array<string | null | undefined> }
) {
  const fallbackRecipients = (process.env.REGISTRATION_NOTIFY_EMAILS || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  const hostRecipients = params.hostEmails?.map((email) => email?.trim()).filter(Boolean) as string[] | undefined;
  const recipients = Array.from(new Set(hostRecipients && hostRecipients.length > 0 ? hostRecipients : fallbackRecipients));

  if (recipients.length === 0) {
    return;
  }

  const safeName = escapeHtml(params.fullName);
  const safeConference = escapeHtml(params.conferenceTitle);
  const action = params.adminUrl
    ? `<p><a href="${escapeHtml(params.adminUrl)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;">ადმინში ნახვა</a></p>`
    : "";

  await sendEmail({
    to: recipients,
    subject: `ახალი რეგისტრაცია — ${params.conferenceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>ახალი რეგისტრაცია</h2>
        <p><strong>დამსწრე:</strong> ${safeName}</p>
        <p><strong>ღონისძიება:</strong> ${safeConference}</p>
        ${action}
      </div>
    `
  });
}
