import { and, eq, isNull, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { bookingReminders, bookings } from "@/lib/db/schema";
import { sendBookingEmail } from "@/lib/email/send";
import { buildBookingSummaryFromRecord } from "@/lib/email/bookingContext";
import { emailLog } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = requireDb();
  const now = new Date();

  const dueReminders = await db
    .select({
      reminder: bookingReminders,
      booking: bookings,
    })
    .from(bookingReminders)
    .innerJoin(bookings, eq(bookingReminders.bookingId, bookings.id))
    .where(
      and(
        isNull(bookingReminders.sentAt),
        lte(bookingReminders.scheduledAt, now),
        eq(bookings.status, "confirmed"),
      ),
    );

  let sent = 0;
  for (const { reminder, booking } of dueReminders) {
    const type = reminder.type === "24h" ? "reminder_24h" : "reminder_1h";
    const summaryItems = await buildBookingSummaryFromRecord(booking);
    const result = await sendBookingEmail(
      type,
      booking,
      booking.locale as "pl" | "en",
      { summaryItems },
    );
    await db.insert(emailLog).values({
      bookingId: booking.id,
      type,
      recipient: booking.guestEmail,
      locale: booking.locale,
      resendId: result.id,
      status: result.status,
    });
    await db
      .update(bookingReminders)
      .set({ sentAt: now })
      .where(eq(bookingReminders.id, reminder.id));
    sent++;
  }

  return NextResponse.json({ sent });
}
