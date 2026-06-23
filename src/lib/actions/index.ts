"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import {
  availabilityExceptions,
  availabilityOverrides,
  availabilityRules,
  bookingEvents,
  bookingReminders,
  bookings,
  clients,
  emailLog,
  hostSettings,
  hosts,
  locations,
  meetingDurations,
} from "@/lib/db/schema";
import { sendBookingEmail } from "@/lib/email/send";
import { getAvailableSlotsForBooking } from "@/lib/slots/service";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSecret,
  isAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import {
  availabilityRuleSchema,
  createBookingSchema,
  durationSchema,
  hostSettingsSchema,
  locationSchema,
} from "@/lib/validations";
import { addHours } from "date-fns";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

async function logEmail(
  bookingId: string,
  type: string,
  recipient: string,
  locale: string,
  resendId?: string,
) {
  const db = requireDb();
  const [log] = await db
    .insert(emailLog)
    .values({
      bookingId,
      type,
      recipient,
      locale,
      resendId,
      status: resendId ? "sent" : "mock",
    })
    .returning();
  return log;
}

async function logBookingEvent(
  bookingId: string,
  actorType: "admin" | "user" | "system",
  fromStatus: string | null,
  toStatus: string,
  reason?: string,
  emailLogId?: string,
) {
  const db = requireDb();
  await db.insert(bookingEvents).values({
    bookingId,
    actorType,
    fromStatus: fromStatus as "pending" | "confirmed" | "cancelled" | "completed" | "no_show" | null,
    toStatus: toStatus as "pending" | "confirmed" | "cancelled" | "completed" | "no_show",
    reason,
    emailLogId,
  });
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV === "development";

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function adminLogin(password: string) {
  const valid = await verifyAdminPassword(password);
  if (!valid) return { success: false };
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getAdminSecret(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return { success: true };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/pl/admin/login");
}

export async function fetchAvailableSlots(
  hostId: string,
  durationId: string,
  userTimezone: string,
): Promise<Record<string, string[]>> {
  return getAvailableSlotsForBooking(hostId, durationId, userTimezone);
}

export async function createBooking(input: unknown) {
  const data = createBookingSchema.parse(input);
  const valid = await verifyTurnstile(data.turnstileToken);
  if (!valid) throw new Error("Turnstile verification failed");

  const db = requireDb();
  const startsAt = new Date(data.startsAt);
  const [duration] = await db
    .select()
    .from(meetingDurations)
    .where(eq(meetingDurations.id, data.durationId));

  if (!duration) throw new Error("Duration not found");

  const endsAt = new Date(startsAt.getTime() + duration.minutes * 60_000);

  const [existingClient] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.hostId, data.hostId), eq(clients.email, data.guestEmail)));

  let clientId = existingClient?.id;
  if (!clientId) {
    const [newClient] = await db
      .insert(clients)
      .values({
        hostId: data.hostId,
        email: data.guestEmail,
        name: data.guestName,
        phone: data.guestPhone,
        locale: data.locale,
      })
      .returning();
    clientId = newClient.id;
  } else {
    await db
      .update(clients)
      .set({
        name: data.guestName,
        phone: data.guestPhone,
        locale: data.locale,
      })
      .where(eq(clients.id, clientId));
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      hostId: data.hostId,
      clientId,
      durationId: data.durationId,
      locationId: data.locationId,
      status: "pending",
      startsAt,
      endsAt,
      userTimezone: data.userTimezone,
      locale: data.locale,
      locationType: data.locationType,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestNotes: data.guestNotes,
    })
    .returning();

  await logBookingEvent(booking.id, "user", null, "pending");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cancelUrl = `${appUrl}/${data.locale}/booking/${booking.id}/cancel?token=${booking.cancelToken}`;

  const userEmail = await sendBookingEmail("request_received", booking, data.locale, {
    cancelUrl,
  });
  await logEmail(booking.id, "request_received", booking.guestEmail, data.locale, userEmail.id);

  const [settings] = await db
    .select()
    .from(hostSettings)
    .where(eq(hostSettings.hostId, data.hostId));

  if (settings) {
    const adminEmail = await sendBookingEmail("new_booking_admin", booking, data.locale, {
      adminEmail: settings.adminEmail,
    });
    await logEmail(
      booking.id,
      "new_booking_admin",
      settings.adminEmail,
      data.locale,
      adminEmail.id,
    );
  }

  revalidatePath("/admin");
  return { bookingId: booking.id };
}

export async function confirmBooking(bookingId: string) {
  await requireAdmin();
  const db = requireDb();

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking || booking.status !== "pending") throw new Error("Invalid booking");

  const [updated] = await db
    .update(bookings)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();

  const email = await sendBookingEmail(
    "confirmed",
    updated,
    updated.locale as "pl" | "en",
  );
  const log = await logEmail(
    bookingId,
    "confirmed",
    updated.guestEmail,
    updated.locale,
    email.id,
  );
  await logBookingEvent(bookingId, "admin", "pending", "confirmed", undefined, log.id);

  await db.insert(bookingReminders).values([
    {
      bookingId,
      type: "24h",
      scheduledAt: addHours(updated.startsAt, -24),
    },
    {
      bookingId,
      type: "1h",
      scheduledAt: addHours(updated.startsAt, -1),
    },
  ]);

  revalidatePath("/admin");
  return { success: true };
}

export async function cancelBooking(
  bookingId: string,
  options?: { reason?: string; byUser?: boolean; token?: string },
) {
  const db = requireDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) throw new Error("Booking not found");

  if (options?.byUser) {
    if (booking.status !== "pending") throw new Error("Cannot cancel");
    if (options.token !== booking.cancelToken) throw new Error("Invalid token");
  } else {
    await requireAdmin();
  }

  if (booking.status === "cancelled") throw new Error("Already cancelled");

  const [updated] = await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelReason: options?.reason,
      cancelledBy: options?.byUser ? "user" : "admin",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  const emailType = options?.byUser ? "cancelled_by_user" : "cancelled_by_admin";
  const email = await sendBookingEmail(
    emailType,
    updated,
    updated.locale as "pl" | "en",
    { reason: options?.reason },
  );
  await logEmail(bookingId, emailType, updated.guestEmail, updated.locale, email.id);
  await logBookingEvent(
    bookingId,
    options?.byUser ? "user" : "admin",
    booking.status,
    "cancelled",
    options?.reason,
    email.id,
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "completed" | "no_show",
) {
  await requireAdmin();
  const db = requireDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) throw new Error("Not found");

  await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));

  await logBookingEvent(bookingId, "admin", booking.status, status);
  revalidatePath("/admin");
}

export async function getBookings(filter?: {
  status?: string;
  search?: string;
}) {
  await requireAdmin();
  const db = requireDb();
  const host = await db.select().from(hosts).limit(1);
  if (!host[0]) return [];

  const conditions = [eq(bookings.hostId, host[0].id)];
  if (filter?.status && filter.status !== "all") {
    conditions.push(eq(bookings.status, filter.status as "pending"));
  }
  if (filter?.search) {
    conditions.push(
      or(
        ilike(bookings.guestName, `%${filter.search}%`),
        ilike(bookings.guestEmail, `%${filter.search}%`),
      )!,
    );
  }

  return db
    .select()
    .from(bookings)
    .where(and(...conditions))
    .orderBy(desc(bookings.createdAt));
}

export async function getBookingById(id: string) {
  const db = requireDb();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
  return booking ?? null;
}

export async function getClients(search?: string) {
  await requireAdmin();
  const db = requireDb();
  const host = await db.select().from(hosts).limit(1);
  if (!host[0]) return [];

  if (search) {
    return db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.hostId, host[0].id),
          or(
            ilike(clients.name, `%${search}%`),
            ilike(clients.email, `%${search}%`),
          )!,
        ),
      )
      .orderBy(desc(clients.createdAt));
  }

  return db
    .select()
    .from(clients)
    .where(eq(clients.hostId, host[0].id))
    .orderBy(desc(clients.createdAt));
}

export async function getClientById(id: string) {
  await requireAdmin();
  const db = requireDb();
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  if (!client) return null;

  const clientBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.clientId, id))
    .orderBy(desc(bookings.startsAt));

  const bookingIds = clientBookings.map((b) => b.id);
  const emails =
    bookingIds.length > 0
      ? await db
          .select()
          .from(emailLog)
          .where(inArray(emailLog.bookingId, bookingIds))
          .orderBy(desc(emailLog.createdAt))
      : [];

  return { client, bookings: clientBookings, emails };
}

export async function updateClientNotes(id: string, notes: string, tags: string[]) {
  await requireAdmin();
  const db = requireDb();
  await db.update(clients).set({ notes, tags }).where(eq(clients.id, id));
  revalidatePath("/admin/clients");
}

export async function upsertAvailabilityRule(hostId: string, data: unknown, id?: string) {
  await requireAdmin();
  const parsed = availabilityRuleSchema.parse(data);
  const db = requireDb();

  if (id) {
    await db
      .update(availabilityRules)
      .set({ ...parsed, hostId })
      .where(eq(availabilityRules.id, id));
  } else {
    await db.insert(availabilityRules).values({ ...parsed, hostId });
  }
  revalidatePath("/admin/availability");
}

export async function deleteAvailabilityRule(id: string) {
  await requireAdmin();
  const db = requireDb();
  await db.delete(availabilityRules).where(eq(availabilityRules.id, id));
  revalidatePath("/admin/availability");
}

export async function upsertException(
  hostId: string,
  data: { date: string; isBlocked: boolean; startTime?: string; endTime?: string; note?: string },
  id?: string,
) {
  await requireAdmin();
  const db = requireDb();
  if (id) {
    await db.update(availabilityExceptions).set({ ...data, hostId }).where(eq(availabilityExceptions.id, id));
  } else {
    await db.insert(availabilityExceptions).values({ ...data, hostId });
  }
  revalidatePath("/admin/availability");
}

export async function deleteException(id: string) {
  await requireAdmin();
  const db = requireDb();
  await db.delete(availabilityExceptions).where(eq(availabilityExceptions.id, id));
  revalidatePath("/admin/availability");
}

export async function upsertOverride(
  hostId: string,
  data: { date: string; startTime: string; endTime: string; note?: string },
  id?: string,
) {
  await requireAdmin();
  const db = requireDb();
  if (id) {
    await db.update(availabilityOverrides).set({ ...data, hostId }).where(eq(availabilityOverrides.id, id));
  } else {
    await db.insert(availabilityOverrides).values({ ...data, hostId });
  }
  revalidatePath("/admin/availability");
}

export async function deleteOverride(id: string) {
  await requireAdmin();
  const db = requireDb();
  await db.delete(availabilityOverrides).where(eq(availabilityOverrides.id, id));
  revalidatePath("/admin/availability");
}

export async function upsertDuration(hostId: string, data: unknown, id?: string) {
  await requireAdmin();
  const parsed = durationSchema.parse(data);
  const db = requireDb();
  if (id) {
    await db.update(meetingDurations).set({ ...parsed, hostId }).where(eq(meetingDurations.id, id));
  } else {
    await db.insert(meetingDurations).values({ ...parsed, hostId });
  }
  revalidatePath("/admin/settings/durations");
}

export async function deleteDuration(id: string) {
  await requireAdmin();
  const db = requireDb();
  await db.delete(meetingDurations).where(eq(meetingDurations.id, id));
  revalidatePath("/admin/settings/durations");
}

export async function upsertLocation(hostId: string, data: unknown, id?: string) {
  await requireAdmin();
  const parsed = locationSchema.parse(data);
  const db = requireDb();
  if (id) {
    await db.update(locations).set({ ...parsed, hostId }).where(eq(locations.id, id));
  } else {
    await db.insert(locations).values({ ...parsed, hostId });
  }
  revalidatePath("/admin/settings/locations");
}

export async function deleteLocation(id: string) {
  await requireAdmin();
  const db = requireDb();
  await db.delete(locations).where(eq(locations.id, id));
  revalidatePath("/admin/settings/locations");
}

export async function updateHostSettings(hostId: string, data: unknown) {
  await requireAdmin();
  const parsed = hostSettingsSchema.parse(data);
  const db = requireDb();
  await db
    .update(hostSettings)
    .set(parsed)
    .where(eq(hostSettings.hostId, hostId));
  revalidatePath("/admin/settings");
}

export async function getAdminDashboardData() {
  await requireAdmin();
  const db = requireDb();
  const [host] = await db.select().from(hosts).limit(1);
  if (!host) return null;

  const allBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.hostId, host.id))
    .orderBy(desc(bookings.createdAt));

  const pending = allBookings.filter((b) => b.status === "pending");
  const rules = await db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.hostId, host.id));
  const settings = await db
    .select()
    .from(hostSettings)
    .where(eq(hostSettings.hostId, host.id));
  const durations = await db
    .select()
    .from(meetingDurations)
    .where(eq(meetingDurations.hostId, host.id));
  const locs = await db
    .select()
    .from(locations)
    .where(eq(locations.hostId, host.id));
  const exceptions = await db
    .select()
    .from(availabilityExceptions)
    .where(eq(availabilityExceptions.hostId, host.id));
  const overrides = await db
    .select()
    .from(availabilityOverrides)
    .where(eq(availabilityOverrides.hostId, host.id));

  return {
    host,
    settings: settings[0],
    bookings: allBookings,
    pendingCount: pending.length,
    rules,
    durations,
    locations: locs,
    exceptions,
    overrides,
  };
}

export async function getBookingFlowData() {
  const db = requireDb();
  const [host] = await db.select().from(hosts).limit(1);
  if (!host) return null;

  const durations = await db
    .select()
    .from(meetingDurations)
    .where(and(eq(meetingDurations.hostId, host.id), eq(meetingDurations.isActive, true)))
    .orderBy(meetingDurations.sortOrder);

  const locs = await db
    .select()
    .from(locations)
    .where(and(eq(locations.hostId, host.id), eq(locations.isActive, true)));

  return { host, durations, locations: locs };
}

export async function exportBookingsCsv() {
  await requireAdmin();
  const data = await getBookings();
  const header = "id,status,guestName,guestEmail,startsAt,locationType\n";
  const rows = data
    .map(
      (b) =>
        `${b.id},${b.status},${b.guestName},${b.guestEmail},${b.startsAt.toISOString()},${b.locationType}`,
    )
    .join("\n");
  return header + rows;
}
