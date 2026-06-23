"use client";

import { formatDateTime } from "@/lib/utils";
import type { bookings } from "@/lib/db/schema";

type Booking = typeof bookings.$inferSelect;

export function AdminCalendar({
  bookings,
  locale,
}: {
  bookings: Booking[];
  locale: string;
}) {
  const active = bookings.filter((b) =>
    ["pending", "confirmed"].includes(b.status),
  );

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {active.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <p className="font-medium text-white">{b.guestName}</p>
          <p className="mt-1 text-sm text-violet-300">
            {formatDateTime(b.startsAt, locale, b.userTimezone)}
          </p>
          <p className="mt-2 text-xs uppercase text-white/40">{b.status}</p>
        </div>
      ))}
      {active.length === 0 && (
        <p className="text-white/40">No upcoming bookings</p>
      )}
    </div>
  );
}
