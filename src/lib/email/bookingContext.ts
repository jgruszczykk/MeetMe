import { and, asc, eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import {
  buildBookingSummaryItems,
  getMeetingPlaceFromResponses,
  getMeetingTypeFromResponses,
  type BookingSummaryItem,
} from "@/lib/booking/summary";
import type { Booking } from "@/lib/db/schema";
import { intakeQuestions, locations, meetingDurations } from "@/lib/db/schema";
import { filterVisibleIntakeQuestions } from "@/lib/intake/showWhen";

export async function buildBookingSummaryFromRecord(
  booking: Booking,
): Promise<BookingSummaryItem[]> {
  const db = requireDb();
  const locale = booking.locale === "pl" ? "pl" : "en";
  const responses = (booking.intakeResponses ?? {}) as Record<string, string | string[]>;

  const [duration] = booking.durationId
    ? await db
        .select()
        .from(meetingDurations)
        .where(eq(meetingDurations.id, booking.durationId))
    : [undefined];

  const [location] = booking.locationId
    ? await db.select().from(locations).where(eq(locations.id, booking.locationId))
    : [undefined];

  const allQuestions = await db
    .select()
    .from(intakeQuestions)
    .where(and(eq(intakeQuestions.hostId, booking.hostId), eq(intakeQuestions.isActive, true)))
    .orderBy(asc(intakeQuestions.sortOrder));

  const meetingType = getMeetingTypeFromResponses(responses);
  const visibleQuestions = filterVisibleIntakeQuestions(allQuestions, {
    locationType: booking.locationType,
    meetingType,
  });

  return buildBookingSummaryItems({
    locale,
    meetingType,
    durationMinutes: duration?.minutes,
    durationLabel: duration?.label,
    locationType: booking.locationType,
    locationLabel: location?.label,
    customMeetingPlace: getMeetingPlaceFromResponses(responses),
    intakeQuestions: visibleQuestions,
    intakeAnswers: responses,
    startsAt: booking.startsAt,
    userTimezone: booking.userTimezone,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
  });
}
