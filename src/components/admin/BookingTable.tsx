"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import type { bookings } from "@/lib/db/schema";
import {
  cancelBooking,
  confirmBooking,
  updateBookingStatus,
} from "@/lib/actions";

type Booking = typeof bookings.$inferSelect;

export function BookingActions({ booking }: { booking: Booking }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const act = async (fn: () => Promise<unknown>, redirectToDetail = false) => {
    setLoading(true);
    try {
      await fn();
      if (redirectToDetail) {
        router.push(`/${locale}/admin/bookings/${booking.id}`);
        router.refresh();
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {booking.status === "pending" && (
        <Button
          disabled={loading}
          onClick={() => act(() => confirmBooking(booking.id), true)}
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

function BookingQuickActions({ booking }: { booking: Booking }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (booking.status !== "pending") return null;

  const act = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      await fn();
      router.push(`/${locale}/admin/bookings/${booking.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        size="sm"
        disabled={loading}
        onClick={() => act(() => confirmBooking(booking.id))}
        data-testid="confirm-booking"
      >
        {t("confirm")}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={loading}
        onClick={() => {
          if (window.confirm(t("quickCancelConfirm"))) {
            void act(() => cancelBooking(booking.id));
          }
        }}
        data-testid="cancel-booking"
      >
        {t("cancelBooking")}
      </Button>
    </div>
  );
}

export function BookingTable({
  bookings: items,
  locale,
  quickActions = false,
}: {
  bookings: Booking[];
  locale: string;
  quickActions?: boolean;
}) {
  const t = useTranslations("admin");
  const tStatus = useTranslations("bookingStatus");
  const router = useRouter();

  const openBooking = (id: string) => {
    router.push(`/${locale}/admin/bookings/${id}`);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="p-4">Guest</th>
            <th className="p-4">When</th>
            <th className="p-4">Status</th>
            {quickActions && <th className="p-4">{t("actions")}</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr
              key={b.id}
              className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/[0.04]"
              onClick={() => openBooking(b.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openBooking(b.id);
                }
              }}
              tabIndex={0}
              role="link"
              aria-label={`${b.guestName} — ${tStatus(b.status)}`}
            >
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
              {quickActions && (
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <BookingQuickActions booking={b} />
                </td>
              )}
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
