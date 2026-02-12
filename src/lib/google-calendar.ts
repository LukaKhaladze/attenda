import { addMinutes } from "date-fns";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function createCalendarEvent(params: {
  userId: string;
  attendeeName: string;
  attendeeLinkedin: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  notes?: string;
}) {
  const account = await prisma.account.findFirst({
    where: {
      userId: params.userId,
      provider: "google"
    }
  });

  if (!account?.access_token) {
    throw new Error("GOOGLE_ACCOUNT_MISSING");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  const nowUnix = Math.floor(Date.now() / 1000);
  let accessToken = account.access_token;

  if (account.expires_at && account.expires_at <= nowUnix && account.refresh_token) {
    oauth2Client.setCredentials({ refresh_token: account.refresh_token });
    const refreshed = await oauth2Client.refreshAccessToken();
    const newToken = refreshed.credentials.access_token;
    const expiresAt = refreshed.credentials.expiry_date
      ? Math.floor(refreshed.credentials.expiry_date / 1000)
      : null;

    if (!newToken) {
      throw new Error("GOOGLE_TOKEN_REFRESH_FAILED");
    }

    accessToken = newToken;

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: newToken,
        expires_at: expiresAt
      }
    });
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: account.refresh_token ?? undefined
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const startDate = new Date(params.startsAt);
  const endDate = addMinutes(startDate, params.durationMinutes);

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: params.title,
      description: [
        `შეხვედრა: ${params.attendeeName}`,
        `LinkedIn: ${params.attendeeLinkedin}`,
        params.notes ? `შენიშვნა: ${params.notes}` : ""
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: startDate.toISOString()
      },
      end: {
        dateTime: endDate.toISOString()
      }
    }
  });

  return event.data.htmlLink;
}
