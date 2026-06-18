import { format } from "date-fns";

type IcsInput = {
  uid: string;
  title: string;
  description: string;
  location?: string;
  startsAt: Date;
  endsAt: Date;
};

function toUtcStamp(date: Date) {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

export function generateIcs(input: IcsInput) {
  const now = toUtcStamp(new Date());
  const starts = toUtcStamp(input.startsAt);
  const ends = toUtcStamp(input.endsAt);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tino Barber//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${starts}`,
    `DTEND:${ends}`,
    `SUMMARY:${input.title}`,
    `DESCRIPTION:${input.description.replace(/\n/g, "\\n")}`,
    input.location ? `LOCATION:${input.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function createGoogleCalendarAddLink(input: {
  title: string;
  details: string;
  startsAt: Date;
  endsAt: Date;
  location?: string;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    details: input.details,
    dates: `${toUtcStamp(input.startsAt)}/${toUtcStamp(input.endsAt)}`,
  });

  if (input.location) {
    params.set("location", input.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
