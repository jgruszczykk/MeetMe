import { describe, expect, it } from "vitest";
import { generateSlots } from "@/lib/slots/generateSlots";

const baseInput = {
  hostTimezone: "Europe/Warsaw",
  userTimezone: "Europe/Warsaw",
  durationMinutes: 30,
  minNoticeMinutes: 0,
  maxHorizonDays: 7,
  dailyBookingLimit: 5,
  defaultBufferBefore: 0,
  defaultBufferAfter: 0,
  rules: [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }],
  exceptions: [],
  overrides: [],
  bookings: [],
  now: new Date("2025-06-23T06:00:00.000Z"), // Monday 08:00 Warsaw
};

describe("generateSlots", () => {
  it("generates slots for matching weekday", () => {
    const slots = generateSlots(baseInput);
    expect(slots.length).toBeGreaterThan(0);
  });

  it("returns empty when day is fully blocked", () => {
    const slots = generateSlots({
      ...baseInput,
      exceptions: [{ date: "2025-06-23", isBlocked: true }],
    });
    expect(slots.length).toBe(0);
  });

  it("excludes booked slots", () => {
    const slots = generateSlots({
      ...baseInput,
      bookings: [
        {
          startsAt: new Date("2025-06-23T07:00:00.000Z"),
          endsAt: new Date("2025-06-23T07:30:00.000Z"),
          status: "confirmed",
        },
      ],
    });
    const hasConflict = slots.some(
      (s) => s.getTime() === new Date("2025-06-23T07:00:00.000Z").getTime(),
    );
    expect(hasConflict).toBe(false);
  });

  it("respects min notice", () => {
    const slots = generateSlots({
      ...baseInput,
      minNoticeMinutes: 600,
      now: new Date("2025-06-23T08:30:00.000Z"),
    });
    expect(slots.every((s) => s > new Date("2025-06-23T18:30:00.000Z"))).toBe(true);
  });
});
