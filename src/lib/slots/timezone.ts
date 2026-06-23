import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function getUserTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "Europe/Warsaw";
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function combineDateAndTimeInZone(
  dateStr: string,
  timeStr: string,
  timeZone: string,
): Date {
  return fromZonedTime(`${dateStr}T${timeStr}:00`, timeZone);
}

export function formatInZone(date: Date, timeZone: string, pattern?: "time" | "date"): string {
  const zoned = toZonedTime(date, timeZone);
  if (pattern === "date") {
    return zoned.toISOString().slice(0, 10);
  }
  return zoned.toISOString().slice(11, 16);
}

export function getDateInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getDayOfWeekInZone(date: Date, timeZone: string): number {
  const zoned = toZonedTime(date, timeZone);
  return zoned.getDay();
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getDateRange(start: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDaysToDateStr(start, i));
}
