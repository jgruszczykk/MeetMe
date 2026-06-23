import { addMinutes, isAfter, isBefore } from "date-fns";
import {
  combineDateAndTimeInZone,
  getDateInZone,
  getDateRange,
  getDayOfWeekInZone,
  parseTimeToMinutes,
} from "./timezone";

export type TimeWindow = { start: Date; end: Date };

export type SlotInput = {
  hostTimezone: string;
  userTimezone: string;
  durationMinutes: number;
  minNoticeMinutes: number;
  maxHorizonDays: number;
  dailyBookingLimit: number;
  defaultBufferBefore: number;
  defaultBufferAfter: number;
  rules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    bufferBefore?: number | null;
    bufferAfter?: number | null;
    validFrom?: string | null;
    validTo?: string | null;
  }>;
  exceptions: Array<{
    date: string;
    isBlocked: boolean;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  overrides: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  bookings: Array<{
    startsAt: Date;
    endsAt: Date;
    status: string;
  }>;
  now?: Date;
};

export function generateWindowsForDay(
  dateStr: string,
  input: SlotInput,
): TimeWindow[] {
  const { hostTimezone, rules, exceptions, overrides } = input;
  const dayOfWeek = getDayOfWeekInZone(new Date(`${dateStr}T12:00:00Z`), hostTimezone);

  const dayExceptions = exceptions.filter((e) => e.date === dateStr);
  if (dayExceptions.some((e) => e.isBlocked && !e.startTime && !e.endTime)) {
    return [];
  }

  const windows: TimeWindow[] = [];

  for (const rule of rules) {
    if (rule.dayOfWeek !== dayOfWeek) continue;
    if (rule.validFrom && dateStr < rule.validFrom) continue;
    if (rule.validTo && dateStr > rule.validTo) continue;

    windows.push({
      start: combineDateAndTimeInZone(dateStr, rule.startTime.slice(0, 5), hostTimezone),
      end: combineDateAndTimeInZone(dateStr, rule.endTime.slice(0, 5), hostTimezone),
    });
  }

  for (const override of overrides.filter((o) => o.date === dateStr)) {
    windows.push({
      start: combineDateAndTimeInZone(dateStr, override.startTime.slice(0, 5), hostTimezone),
      end: combineDateAndTimeInZone(dateStr, override.endTime.slice(0, 5), hostTimezone),
    });
  }

  for (const ex of dayExceptions.filter((e) => e.isBlocked && e.startTime && e.endTime)) {
    const blockStart = combineDateAndTimeInZone(dateStr, ex.startTime!.slice(0, 5), hostTimezone);
    const blockEnd = combineDateAndTimeInZone(dateStr, ex.endTime!.slice(0, 5), hostTimezone);
    return subtractWindow(windows, blockStart, blockEnd);
  }

  return windows;
}

function subtractWindow(
  windows: TimeWindow[],
  blockStart: Date,
  blockEnd: Date,
): TimeWindow[] {
  const result: TimeWindow[] = [];
  for (const w of windows) {
    if (blockEnd <= w.start || blockStart >= w.end) {
      result.push(w);
      continue;
    }
    if (blockStart > w.start) {
      result.push({ start: w.start, end: blockStart });
    }
    if (blockEnd < w.end) {
      result.push({ start: blockEnd, end: w.end });
    }
  }
  return result;
}

function overlaps(
  slotStart: Date,
  slotEnd: Date,
  busyStart: Date,
  busyEnd: Date,
): boolean {
  return slotStart < busyEnd && slotEnd > busyStart;
}

export function generateSlots(input: SlotInput): Date[] {
  const now = input.now ?? new Date();
  const minStart = addMinutes(now, input.minNoticeMinutes);
  const maxEnd = addMinutes(now, input.maxHorizonDays * 24 * 60);

  const todayInHost = getDateInZone(now, input.hostTimezone);
  const dates = getDateRange(todayInHost, input.maxHorizonDays + 1);

  const activeBookings = input.bookings.filter((b) =>
    ["pending", "confirmed"].includes(b.status),
  );

  const slots: Date[] = [];
  const bookingsPerDay: Record<string, number> = {};

  for (const dateStr of dates) {
    const windows = generateWindowsForDay(dateStr, input);
    const dayBookingCount = activeBookings.filter(
      (b) => getDateInZone(b.startsAt, input.hostTimezone) === dateStr,
    ).length;

    if (dayBookingCount >= input.dailyBookingLimit) continue;

    for (const window of windows) {
      let cursor = new Date(window.start);

      while (addMinutes(cursor, input.durationMinutes) <= window.end) {
        const slotStart = new Date(cursor);
        const slotEnd = addMinutes(slotStart, input.durationMinutes);

        if (isBefore(slotStart, minStart) || isAfter(slotStart, maxEnd)) {
          cursor = addMinutes(cursor, input.durationMinutes);
          continue;
        }

        const bufferBefore = input.defaultBufferBefore;
        const bufferAfter = input.defaultBufferAfter;
        const bufferedStart = addMinutes(slotStart, -bufferBefore);
        const bufferedEnd = addMinutes(slotEnd, bufferAfter);

        const hasConflict = activeBookings.some((b) =>
          overlaps(bufferedStart, bufferedEnd, b.startsAt, b.endsAt),
        );

        if (!hasConflict) {
          const dayKey = getDateInZone(slotStart, input.hostTimezone);
          bookingsPerDay[dayKey] = (bookingsPerDay[dayKey] ?? 0);
          if (dayBookingCount + (bookingsPerDay[dayKey] ?? 0) < input.dailyBookingLimit) {
            slots.push(slotStart);
            bookingsPerDay[dayKey]++;
          }
        }

        cursor = addMinutes(cursor, input.durationMinutes);
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}

export function groupSlotsByDate(
  slots: Date[],
  timeZone: string,
): Record<string, string[]> {
  return slots.reduce<Record<string, string[]>>((acc, slot) => {
    const date = getDateInZone(slot, timeZone);
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(slot);
    if (!acc[date]) acc[date] = [];
    acc[date].push(time);
    return acc;
  }, {});
}

export { parseTimeToMinutes };
