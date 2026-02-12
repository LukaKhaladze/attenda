import { addMinutes } from "date-fns";

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function createIcsFile(params: {
  uid: string;
  title: string;
  description: string;
  startsAt: Date;
  durationMinutes: number;
}) {
  const end = addMinutes(params.startsAt, params.durationMinutes);
  const format = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Attenda.ge//Conference Networking//KA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(params.uid)}`,
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(params.startsAt)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${escapeIcs(params.title)}`,
    `DESCRIPTION:${escapeIcs(params.description)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
