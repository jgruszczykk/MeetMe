import type { BookingSummaryItem } from "@/lib/booking/summary";
import type { Booking, locations } from "@/lib/db/schema";

type Location = typeof locations.$inferSelect;

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\n");
}

function foldIcsLine(line: string): string {
  const max = 75;
  if (line.length <= max) return line;

  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, max));
  rest = rest.slice(max);

  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`);
    rest = rest.slice(max - 1);
  }

  return parts.join("\r\n");
}

function icsProperty(name: string, value: string): string {
  if (!value) return "";
  return foldIcsLine(`${name}:${escapeIcsText(value)}`);
}

export function resolveBookingIcsLocation(
  booking: Pick<Booking, "locationType" | "guestPhone">,
  location?: Pick<Location, "label" | "address" | "onlineUrl" | "phone"> | null,
  customPlace?: string,
): string | undefined {
  const place = customPlace?.trim();
  if (place) return place;

  if (!location) {
    if (booking.locationType === "phone" && booking.guestPhone?.trim()) {
      return booking.guestPhone.trim();
    }
    return undefined;
  }

  if (booking.locationType === "online") {
    return location.onlineUrl?.trim() || location.label;
  }

  if (booking.locationType === "phone") {
    return location.phone?.trim() || booking.guestPhone?.trim() || location.label;
  }

  if (booking.locationType === "in_person") {
    const address = location.address?.trim();
    return address ? `${location.label}, ${address}` : location.label;
  }

  return location.label;
}

export type BuildBookingIcsInput = {
  booking: Booking;
  locale: "pl" | "en";
  summaryItems: BookingSummaryItem[];
  locationLine?: string;
  onlineUrl?: string;
};

function buildIcsDescription(
  booking: Booking,
  locale: "pl" | "en",
  summaryItems: BookingSummaryItem[],
): string {
  const lines = summaryItems.map((item) => `${item.label}: ${item.value}`);

  if (booking.guestPhone?.trim()) {
    const phoneLabel = locale === "pl" ? "Telefon" : "Phone";
    const phone = booking.guestPhone.trim();
    if (!lines.some((line) => line.includes(phone))) {
      lines.push(`${phoneLabel}: ${phone}`);
    }
  }

  if (booking.guestNotes?.trim()) {
    const notesLabel = locale === "pl" ? "Notatki" : "Notes";
    lines.push(`${notesLabel}: ${booking.guestNotes.trim()}`);
  }

  return lines.join("\n");
}

function buildIcsSummary(
  booking: Booking,
  locale: "pl" | "en",
  summaryItems: BookingSummaryItem[],
): string {
  const meetingType = summaryItems.find((item) => item.key === "meetingType")?.value;
  const guest = booking.guestName.trim();

  if (meetingType && guest) {
    return locale === "pl"
      ? `Spotkanie MeetMe — ${meetingType} (${guest})`
      : `MeetMe meeting — ${meetingType} (${guest})`;
  }

  if (guest) {
    return locale === "pl" ? `Spotkanie MeetMe — ${guest}` : `MeetMe meeting — ${guest}`;
  }

  return locale === "pl" ? "Spotkanie MeetMe" : "MeetMe meeting";
}

export function buildBookingIcs(input: BuildBookingIcsInput): string {
  const { booking, locale, summaryItems, locationLine, onlineUrl } = input;

  const start = booking.startsAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = booking.endsAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const properties = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MeetMe//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@meetme`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    icsProperty("SUMMARY", buildIcsSummary(booking, locale, summaryItems)),
    icsProperty("DESCRIPTION", buildIcsDescription(booking, locale, summaryItems)),
    locationLine ? icsProperty("LOCATION", locationLine) : "",
    onlineUrl ? icsProperty("URL", onlineUrl) : "",
    `STATUS:CONFIRMED`,
    foldIcsLine(
      `ATTENDEE;CN=${escapeIcsText(booking.guestName)};RSVP=FALSE;ROLE=REQ-PARTICIPANT:mailto:${booking.guestEmail}`,
    ),
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return properties.join("\r\n");
}
