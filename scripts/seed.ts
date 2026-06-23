import "dotenv/config";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const defaultIntakeQuestions = (hostId: string) => [
  {
    hostId,
    key: "meeting_reason",
    type: "select" as const,
    labelPl: "Powód spotkania",
    labelEn: "Meeting reason",
    options: [
      { value: "consultation", labelPl: "Konsultacja", labelEn: "Consultation" },
      { value: "follow_up", labelPl: "Kontynuacja", labelEn: "Follow-up" },
      { value: "pitch", labelPl: "Prezentacja / pitch", labelEn: "Pitch / presentation" },
      { value: "other", labelPl: "Inne", labelEn: "Other" },
    ],
    required: true,
    sortOrder: 0,
    isActive: true,
    showWhen: { meetingType: "business" },
  },
  {
    hostId,
    key: "meeting_reason_details",
    type: "textarea" as const,
    labelPl: "Szczegóły",
    labelEn: "Details",
    placeholderPl: "Opisz krótko temat spotkania",
    placeholderEn: "Briefly describe the meeting topic",
    required: true,
    sortOrder: 1,
    isActive: true,
    showWhen: { meetingType: "business" },
  },
  {
    hostId,
    key: "company",
    type: "text" as const,
    labelPl: "Firma",
    labelEn: "Company",
    required: false,
    sortOrder: 2,
    isActive: true,
    showWhen: { meetingType: "business" },
  },
  {
    hostId,
    key: "social_plan",
    type: "select" as const,
    labelPl: "Co wolisz zrobić?",
    labelEn: "What would you like to do?",
    options: [
      { value: "coffee", labelPl: "Kawa", labelEn: "Coffee", emoji: "☕" },
      { value: "lunch", labelPl: "Lunch", labelEn: "Lunch", emoji: "🍽️" },
      { value: "walk", labelPl: "Spacer", labelEn: "Walk", emoji: "🚶" },
      { value: "other", labelPl: "Inne", labelEn: "Other", emoji: "💬" },
    ],
    required: true,
    sortOrder: 0,
    isActive: true,
    showWhen: { meetingType: "social" },
  },
  {
    hostId,
    key: "about_you",
    type: "textarea" as const,
    labelPl: "O czym chcesz porozmawiać?",
    labelEn: "What would you like to talk about?",
    placeholderPl: "Czy masz coś konkretnego, co chcesz omówić lub zrobić?",
    placeholderEn: "Anything specific you'd like to discuss or do?",
    required: true,
    sortOrder: 1,
    isActive: true,
    showWhen: { meetingType: "social" },
  },
  {
    hostId,
    key: "vibe",
    type: "text" as const,
    labelPl: "Dodatkowe informacje",
    labelEn: "Additional notes",
    placeholderPl: "Wszystko, co warto wiedzieć przed spotkaniem",
    placeholderEn: "Anything useful to know before the meeting",
    required: false,
    sortOrder: 2,
    isActive: true,
    showWhen: { meetingType: "social" },
  },
  {
    hostId,
    key: "guest_phone",
    type: "phone" as const,
    labelPl: "Telefon",
    labelEn: "Phone",
    required: false,
    sortOrder: 10,
    isActive: true,
    showWhen: { locationType: "phone" },
  },
  {
    hostId,
    key: "location_preference",
    type: "select" as const,
    labelPl: "Gdzie wolisz się spotkać?",
    labelEn: "Where would you prefer to meet?",
    options: [
      { value: "cafe", labelPl: "Kawiarnia", labelEn: "Cafe", emoji: "☕" },
      { value: "bar", labelPl: "Bar / restauracja", labelEn: "Bar / restaurant", emoji: "🍽️" },
      { value: "park", labelPl: "Park / spacer", labelEn: "Park / walk", emoji: "🌳" },
      { value: "office", labelPl: "Biuro", labelEn: "Office", emoji: "🏢" },
    ],
    required: false,
    sortOrder: 11,
    isActive: true,
    showWhen: { locationType: "in_person" },
  },
];

async function seed() {
  const { hosts, hostSettings, meetingDurations, locations, availabilityRules, intakeQuestions } =
    schema;

  console.log("Seeding database...");

  const [host] = await db
    .insert(hosts)
    .values({
      slug: "default",
      name: "MeetMe Host",
      timezone: "Europe/Warsaw",
    })
    .onConflictDoNothing()
    .returning();

  const hostId =
    host?.id ??
    (await db.select().from(hosts).where(eq(hosts.slug, "default")))[0]?.id;

  if (!hostId) throw new Error("Failed to create host");

  await db
    .insert(hostSettings)
    .values({
      hostId,
      minNoticeMinutes: 120,
      maxHorizonDays: 60,
      dailyBookingLimit: 5,
      defaultBufferBefore: 0,
      defaultBufferAfter: 15,
      adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.com",
    })
    .onConflictDoNothing();

  const existingDurations = await db
    .select()
    .from(meetingDurations)
    .where(eq(meetingDurations.hostId, hostId));

  if (existingDurations.length === 0) {
    await db.insert(meetingDurations).values([
      { hostId, minutes: 30, label: "30 min", sortOrder: 0 },
      { hostId, minutes: 45, label: "45 min", sortOrder: 1 },
      { hostId, minutes: 60, label: "60 min", sortOrder: 2 },
    ]);
  }

  const existingLocations = await db
    .select()
    .from(locations)
    .where(eq(locations.hostId, hostId));

  if (existingLocations.length === 0) {
    await db.insert(locations).values([
      {
        hostId,
        type: "online",
        label: "Google Meet",
        onlineUrl: "https://meet.google.com",
      },
      { hostId, type: "phone", label: "Phone call" },
      {
        hostId,
        type: "in_person",
        label: "Kawiarnia",
        address: "Warszawa",
      },
    ]);
  }

  const existingRules = await db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.hostId, hostId));

  if (existingRules.length === 0) {
    await db.insert(availabilityRules).values([
      { hostId, dayOfWeek: 0, startTime: "10:00", endTime: "14:00" },
      { hostId, dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { hostId, dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { hostId, dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { hostId, dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { hostId, dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
      { hostId, dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
    ]);
  }

  for (const question of defaultIntakeQuestions(hostId)) {
    await db
      .insert(intakeQuestions)
      .values(question)
      .onConflictDoUpdate({
        target: [intakeQuestions.hostId, intakeQuestions.key],
        set: {
          type: question.type,
          labelPl: question.labelPl,
          labelEn: question.labelEn,
          placeholderPl: question.placeholderPl ?? null,
          placeholderEn: question.placeholderEn ?? null,
          options: question.options ?? null,
          required: question.required,
          sortOrder: question.sortOrder,
          isActive: question.isActive,
          showWhen: question.showWhen ?? null,
        },
      });
  }

  console.log("Seed complete. Host ID:", hostId);
}

seed().catch(console.error);
