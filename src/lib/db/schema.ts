import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  date,
} from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
]);

export const locationTypeEnum = pgEnum("location_type", [
  "online",
  "phone",
  "in_person",
]);

export const actorTypeEnum = pgEnum("actor_type", ["admin", "user", "system"]);

export const cancelledByEnum = pgEnum("cancelled_by", ["admin", "user"]);

export const reminderTypeEnum = pgEnum("reminder_type", ["24h", "1h"]);

export const intakeQuestionTypeEnum = pgEnum("intake_question_type", [
  "select",
  "multiselect",
  "text",
  "textarea",
  "phone",
  "email",
]);

export const hosts = pgTable("hosts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Europe/Warsaw"),
  clerkUserId: text("clerk_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const hostSettings = pgTable("host_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostId: uuid("host_id")
    .notNull()
    .references(() => hosts.id, { onDelete: "cascade" })
    .unique(),
  minNoticeMinutes: integer("min_notice_minutes").notNull().default(120),
  maxHorizonDays: integer("max_horizon_days").notNull().default(60),
  dailyBookingLimit: integer("daily_booking_limit").notNull().default(5),
  defaultBufferBefore: integer("default_buffer_before").notNull().default(0),
  defaultBufferAfter: integer("default_buffer_after").notNull().default(15),
  adminEmail: text("admin_email").notNull(),
});

export const meetingDurations = pgTable("meeting_durations", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostId: uuid("host_id")
    .notNull()
    .references(() => hosts.id, { onDelete: "cascade" }),
  minutes: integer("minutes").notNull(),
  label: text("label").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  priceCents: integer("price_cents"),
  currency: text("currency").default("PLN"),
});

export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostId: uuid("host_id")
    .notNull()
    .references(() => hosts.id, { onDelete: "cascade" }),
  type: locationTypeEnum("type").notNull(),
  label: text("label").notNull(),
  address: text("address"),
  onlineUrl: text("online_url"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
});

export const availabilityRules = pgTable("availability_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostId: uuid("host_id")
    .notNull()
    .references(() => hosts.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  bufferBefore: integer("buffer_before"),
  bufferAfter: integer("buffer_after"),
  validFrom: date("valid_from"),
  validTo: date("valid_to"),
});

export const availabilityExceptions = pgTable("availability_exceptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostId: uuid("host_id")
    .notNull()
    .references(() => hosts.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  isBlocked: boolean("is_blocked").notNull().default(true),
  startTime: time("start_time"),
  endTime: time("end_time"),
  note: text("note"),
});

export const availabilityOverrides = pgTable("availability_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostId: uuid("host_id")
    .notNull()
    .references(() => hosts.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  note: text("note"),
});

export const intakeQuestions = pgTable(
  "intake_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hostId: uuid("host_id")
      .notNull()
      .references(() => hosts.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    type: intakeQuestionTypeEnum("type").notNull(),
    labelPl: text("label_pl").notNull(),
    labelEn: text("label_en").notNull(),
    placeholderPl: text("placeholder_pl"),
    placeholderEn: text("placeholder_en"),
    options: jsonb("options"),
    required: boolean("required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    showWhen: jsonb("show_when"),
  },
  (table) => [uniqueIndex("intake_questions_host_key_idx").on(table.hostId, table.key)],
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hostId: uuid("host_id")
      .notNull()
      .references(() => hosts.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    locale: text("locale").notNull().default("pl"),
    tags: text("tags").array().notNull().default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("clients_host_email_idx").on(table.hostId, table.email)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hostId: uuid("host_id")
      .notNull()
      .references(() => hosts.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    durationId: uuid("duration_id")
      .notNull()
      .references(() => meetingDurations.id),
    locationId: uuid("location_id").references(() => locations.id),
    status: bookingStatusEnum("status").notNull().default("pending"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    userTimezone: text("user_timezone").notNull(),
    locale: text("locale").notNull().default("pl"),
    locationType: locationTypeEnum("location_type").notNull(),
    guestName: text("guest_name").notNull(),
    guestEmail: text("guest_email").notNull(),
    guestPhone: text("guest_phone"),
    guestNotes: text("guest_notes"),
    intakeResponses: jsonb("intake_responses"),
    cancelReason: text("cancel_reason"),
    cancelledBy: cancelledByEnum("cancelled_by"),
    cancelToken: uuid("cancel_token").defaultRandom().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("bookings_host_status_starts_idx").on(table.hostId, table.status, table.startsAt),
    index("bookings_host_starts_idx").on(table.hostId, table.startsAt),
  ],
);

export const bookingEvents = pgTable("booking_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  actorType: actorTypeEnum("actor_type").notNull(),
  fromStatus: bookingStatusEnum("from_status"),
  toStatus: bookingStatusEnum("to_status").notNull(),
  reason: text("reason"),
  emailLogId: uuid("email_log_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailLog = pgTable("email_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  recipient: text("recipient").notNull(),
  locale: text("locale").notNull(),
  resendId: text("resend_id"),
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookingReminders = pgTable("booking_reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  type: reminderTypeEnum("type").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export type Host = typeof hosts.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BookingStatus = Booking["status"];
export type IntakeQuestion = typeof intakeQuestions.$inferSelect;
