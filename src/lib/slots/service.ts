import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import {
  availabilityExceptions,
  availabilityOverrides,
  availabilityRules,
  bookings,
  hostSettings,
  hosts,
  meetingDurations,
} from "@/lib/db/schema";
import { generateSlots, groupSlotsByDate } from "@/lib/slots/generateSlots";

export async function getDefaultHost() {
  const db = requireDb();
  const [host] = await db.select().from(hosts).limit(1);
  return host ?? null;
}

export async function getHostContext(hostId: string) {
  const db = requireDb();
  const [host] = await db.select().from(hosts).where(eq(hosts.id, hostId));
  const [settings] = await db
    .select()
    .from(hostSettings)
    .where(eq(hostSettings.hostId, hostId));
  const rules = await db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.hostId, hostId));
  const exceptions = await db
    .select()
    .from(availabilityExceptions)
    .where(eq(availabilityExceptions.hostId, hostId));
  const overrides = await db
    .select()
    .from(availabilityOverrides)
    .where(eq(availabilityOverrides.hostId, hostId));
  const activeBookings = await db
    .select({
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.hostId, hostId));

  return { host, settings, rules, exceptions, overrides, activeBookings };
}

export async function getAvailableSlotsForBooking(
  hostId: string,
  durationId: string,
  userTimezone: string,
): Promise<Record<string, string[]>> {
  const db = requireDb();
  const ctx = await getHostContext(hostId);
  if (!ctx.host || !ctx.settings) return {};

  const [duration] = await db
    .select()
    .from(meetingDurations)
    .where(eq(meetingDurations.id, durationId));

  if (!duration) return {};

  const slots = generateSlots({
    hostTimezone: ctx.host.timezone,
    userTimezone,
    durationMinutes: duration.minutes,
    minNoticeMinutes: ctx.settings.minNoticeMinutes,
    maxHorizonDays: ctx.settings.maxHorizonDays,
    dailyBookingLimit: ctx.settings.dailyBookingLimit,
    defaultBufferBefore: ctx.settings.defaultBufferBefore,
    defaultBufferAfter: ctx.settings.defaultBufferAfter,
    rules: ctx.rules,
    exceptions: ctx.exceptions,
    overrides: ctx.overrides,
    bookings: ctx.activeBookings,
  });

  return groupSlotsByDate(slots, userTimezone);
}
