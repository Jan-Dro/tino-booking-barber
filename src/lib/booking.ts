import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  parse,
  set,
  startOfDay,
} from "date-fns";
import { getServerEnv } from "@/lib/env";
import { listCalendarBlocks } from "@/lib/google-calendar";
import type { CalendarBlock, TimeSlot } from "@/lib/types";

const DAY_KEYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function timeStringToDate(day: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return set(day, { hours, minutes, seconds: 0, milliseconds: 0 });
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

function parseExplicitDaySlots(day: Date, rawSlots?: string) {
  if (!rawSlots) return [] as Date[];

  return rawSlots
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((time) => timeStringToDate(day, time));
}

export function isSlotAvailable(slotStart: Date, slotEnd: Date, blocked: CalendarBlock[]) {
  const now = new Date();
  if (isBefore(slotStart, now)) {
    return false;
  }

  return !blocked.some((block) => overlaps(slotStart, slotEnd, block.start, block.end));
}

export async function getAvailableTimeSlots(dateString: string, serviceDuration: number): Promise<TimeSlot[]> {
  const env = getServerEnv();
  const day = parse(dateString, "yyyy-MM-dd", new Date());
  const dayName = DAY_KEYS[day.getDay()];
  const explicitSlots = parseExplicitDaySlots(
    day,
    env[`${dayName}_SLOTS` as keyof typeof env] as string | undefined,
  );

  const startTime = env[`${dayName}_START` as keyof typeof env] as string;
  const endTime = env[`${dayName}_END` as keyof typeof env] as string;

  const blocked = await listCalendarBlocks(startOfDay(day), addMinutes(startOfDay(day), 24 * 60));
  const slots: TimeSlot[] = [];

  if (explicitSlots.length > 0) {
    for (const slotStart of explicitSlots) {
      const slotEnd = addMinutes(slotStart, serviceDuration);
      if (!isSlotAvailable(slotStart, slotEnd, blocked)) {
        continue;
      }

      slots.push({
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
        label: format(slotStart, "h:mm a"),
      });
    }

    return slots;
  }

  if (startTime === endTime) {
    return [];
  }

  const open = timeStringToDate(day, startTime);
  const close = timeStringToDate(day, endTime);
  if (!isAfter(close, open)) {
    return [];
  }

  let cursor = open;
  while (isBefore(addMinutes(cursor, serviceDuration), addMinutes(close, 1))) {
    const end = addMinutes(cursor, serviceDuration);

    if (isSlotAvailable(cursor, end, blocked)) {
      slots.push({
        startsAt: cursor.toISOString(),
        endsAt: end.toISOString(),
        label: format(cursor, "h:mm a"),
      });
    }

    cursor = addMinutes(cursor, 15);
  }

  return slots;
}

export function buildBookingSummary(input: {
  serviceName: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
}) {
  return [
    `Service: ${input.serviceName}`,
    `Customer: ${input.customerName}`,
    `Phone: ${input.customerPhone}`,
    input.notes ? `Notes: ${input.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
