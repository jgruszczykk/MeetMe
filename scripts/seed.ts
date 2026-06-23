import "dotenv/config";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  const { hosts, hostSettings, meetingDurations, locations, availabilityRules } = schema;

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
        label: "Office",
        address: "Warsaw, Poland",
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

  console.log("Seed complete. Host ID:", hostId);
}

seed().catch(console.error);
