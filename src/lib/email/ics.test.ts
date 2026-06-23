import { describe, expect, it } from "vitest";
import { buildBookingIcs, escapeIcsText, resolveBookingIcsLocation } from "@/lib/email/ics";
import type { Booking } from "@/lib/db/schema";

const baseBooking = {
  id: "11111111-1111-1111-1111-111111111111",
  hostId: "host",
  clientId: "client",
  durationId: "duration",
  locationId: "location",
  status: "confirmed",
  startsAt: new Date("2026-06-23T10:00:00.000Z"),
  endsAt: new Date("2026-06-23T11:00:00.000Z"),
  userTimezone: "Europe/Warsaw",
  locale: "pl",
  locationType: "in_person",
  guestName: "Jan Kowalski",
  guestEmail: "jan@example.com",
  guestPhone: "+48123456789",
  guestNotes: "Proszę o stolik przy oknie",
  intakeResponses: { meeting_place: "Kawiarnia Deser" },
  cancelReason: null,
  cancelledBy: null,
  cancelToken: "token",
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Booking;

describe("escapeIcsText", () => {
  it("escapes separators and newlines", () => {
    expect(escapeIcsText("a;b\nc,d")).toBe("a\\;b\\nc\\,d");
  });
});

describe("resolveBookingIcsLocation", () => {
  it("prefers custom meeting place", () => {
    expect(
      resolveBookingIcsLocation(
        baseBooking,
        { label: "Office", address: "Warszawa", onlineUrl: null, phone: null },
        "Kawiarnia Deser",
      ),
    ).toBe("Kawiarnia Deser");
  });

  it("uses online url when available", () => {
    expect(
      resolveBookingIcsLocation(
        { ...baseBooking, locationType: "online" },
        {
          label: "Google Meet",
          address: null,
          onlineUrl: "https://meet.google.com/abc",
          phone: null,
        },
      ),
    ).toBe("https://meet.google.com/abc");
  });
});

describe("buildBookingIcs", () => {
  it("includes summary fields in description", () => {
    const ics = buildBookingIcs({
      booking: baseBooking,
      locale: "pl",
      locationLine: "Kawiarnia Deser",
      summaryItems: [
        { key: "meetingType", label: "Rodzaj spotkania", value: "Towarzyskie" },
        { key: "duration", label: "Czas trwania", value: "60 min" },
      ],
    });

    expect(ics).toContain("SUMMARY:Spotkanie MeetMe");
    expect(ics).toContain("Rodzaj spotkania: Towarzyskie");
    expect(ics).toContain("Czas trwania: 60 min");
    expect(ics).toContain("LOCATION:Kawiarnia Deser");
    expect(ics).toContain("Notatki: Proszę o stolik przy oknie");
    expect(ics).toContain("ATTENDEE");
    expect(ics.replace(/\r?\n /g, "")).toContain("mailto:jan@example.com");
    expect(ics).toContain("STATUS:CONFIRMED");
  });
});
