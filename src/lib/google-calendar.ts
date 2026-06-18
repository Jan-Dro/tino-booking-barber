import { google } from "googleapis";
import { getServerEnv } from "@/lib/env";
import type { CalendarBlock } from "@/lib/types";

export class GoogleCalendarError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GoogleCalendarError";
    this.status = status;
  }
}

type EventInput = {
  summary: string;
  description: string;
  start: Date;
  end: Date;
};

function getCalendarClient() {
  const env = getServerEnv();
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_CALENDAR_ID) {
    throw new GoogleCalendarError(
      "Google Calendar is not fully configured. Set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_CALENDAR_ID.",
      500,
    );
  }

  const jwt = new google.auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth: jwt });
}

export async function listCalendarBlocks(start: Date, end: Date): Promise<CalendarBlock[]> {
  const env = getServerEnv();
  const calendar = getCalendarClient();
  try {
    const response = await calendar.events.list({
      calendarId: env.GOOGLE_CALENDAR_ID,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return (response.data.items ?? [])
      .map((event) => {
        const startRaw = event.start?.dateTime ?? event.start?.date;
        const endRaw = event.end?.dateTime ?? event.end?.date;
        if (!startRaw || !endRaw) return null;

        return {
          start: new Date(startRaw),
          end: new Date(endRaw),
        };
      })
      .filter((block): block is CalendarBlock => Boolean(block));
  } catch (error) {
    const err = error as { status?: number; code?: number; message?: string };
    if (err.status === 404 || err.code === 404) {
      throw new GoogleCalendarError(
        "Google Calendar ID was not found or is not shared with the service account.",
        404,
      );
    }

    throw new GoogleCalendarError(
      `Google Calendar request failed${err.message ? `: ${err.message}` : ""}`,
      err.status,
    );
  }
}

export async function createCalendarBookingEvent(input: EventInput) {
  const env = getServerEnv();
  const calendar = getCalendarClient();

  try {
    const response = await calendar.events.insert({
      calendarId: env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.start.toISOString() },
        end: { dateTime: input.end.toISOString() },
      },
    });

    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    const err = error as { status?: number; code?: number; message?: string };
    if (
      (err.status === 403 || err.code === 403) &&
      err.message?.includes("Service accounts cannot invite attendees")
    ) {
      throw new GoogleCalendarError(
        "Google service accounts cannot send attendee invites on this account. Booking still uses email ICS and Add-to-Google links.",
        403,
      );
    }

    throw new GoogleCalendarError(
      `Failed to create Google Calendar event${err.message ? `: ${err.message}` : ""}`,
      err.status,
    );
  }
}

export async function cancelCalendarEvent(eventId: string) {
  const env = getServerEnv();
  const calendar = getCalendarClient();

  await calendar.events.delete({
    calendarId: env.GOOGLE_CALENDAR_ID,
    eventId,
  });
}
