"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const router = useRouter();
  const tStatus = useTranslations("bookingStatus");

  const active = bookings.filter((b) =>
    ["pending", "confirmed"].includes(b.status),
  );

  const openBooking = (id: string) => {
    router.push(`/${locale}/admin/bookings/${id}`);
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {active.map((b) => (
        <div
          key={b.id}
          role="link"
          tabIndex={0}
          aria-label={`${b.guestName} — ${tStatus(b.status)}`}
          className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-violet-400/30 hover:bg-white/[0.08]"
          onClick={() => openBooking(b.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openBooking(b.id);
            }
          }}
        >
          <p className="font-medium text-white">{b.guestName}</p>
          <p className="mt-1 text-sm text-violet-300">
            {formatDateTime(b.startsAt, locale, b.userTimezone)}
          </p>
          <p className="mt-2 text-xs uppercase text-white/40">{tStatus(b.status)}</p>
        </div>
      ))}
      {active.length === 0 && (
        <p className="text-white/40">No upcoming bookings</p>
      )}
    </div>
  );
}
