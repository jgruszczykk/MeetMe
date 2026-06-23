"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { bookings } from "@/lib/db/schema";
import {
  cancelBooking,
  confirmBooking,
  updateBookingStatus,
} from "@/lib/actions";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/input";

type Booking = typeof bookings.$inferSelect;

export function BookingActions({ booking }: { booking: Booking }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const act = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      await fn();
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {booking.status === "pending" && (
        <Button
          disabled={loading}
          onClick={() => act(() => confirmBooking(booking.id))}
          className="w-full"
          data-testid="confirm-booking"
        >
          {t("confirm")}
        </Button>
      )}
      {(booking.status === "pending" || booking.status === "confirmed") && (
        <div className="space-y-2">
          <Textarea
            placeholder={t("cancelReason")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => act(() => cancelBooking(booking.id, { reason }))}
            className="w-full"
          >
            {t("cancelBooking")}
          </Button>
        </div>
      )}
      {booking.status === "confirmed" && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={loading}
            onClick={() => act(() => updateBookingStatus(booking.id, "completed"))}
          >
            {t("markCompleted")}
          </Button>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => act(() => updateBookingStatus(booking.id, "no_show"))}
          >
            {t("markNoShow")}
          </Button>
        </div>
      )}
      <Link href={`/${locale}/admin/bookings`}>
        <Button variant="ghost" className="w-full">
          ← {t("bookings")}
        </Button>
      </Link>
    </div>
  );
}

export function BookingTable({
  bookings: items,
  locale,
}: {
  bookings: Booking[];
  locale: string;
}) {
  const t = useTranslations("admin");
  const tStatus = useTranslations("bookingStatus");

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="p-4">Guest</th>
            <th className="p-4">When</th>
            <th className="p-4">Status</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id} className="border-t border-white/5">
              <td className="p-4">
                <p className="font-medium text-white">{b.guestName}</p>
                <p className="text-white/50">{b.guestEmail}</p>
              </td>
              <td className="p-4 text-white/80">
                {formatDateTime(b.startsAt, locale, b.userTimezone)}
              </td>
              <td className="p-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    b.status === "pending"
                      ? "bg-amber-500/20 text-amber-300"
                      : b.status === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/10 text-white/60"
                  }`}
                >
                  {tStatus(b.status)}
                </span>
              </td>
              <td className="p-4">
                <Link href={`/${locale}/admin/bookings/${b.id}`}>
                  <Button size="sm" variant="ghost">
                    →
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <p className="p-8 text-center text-white/40">No bookings</p>
      )}
    </div>
  );
}
