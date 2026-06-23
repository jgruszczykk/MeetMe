import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BookingActions } from "@/components/admin/BookingTable";
import { getBookingById } from "@/lib/actions";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/input";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bookingStatus");

  const booking = await getBookingById(id);
  if (!booking) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <h1 className="text-2xl font-bold text-white">{booking.guestName}</h1>
        <p className="mt-2 text-white/60">{booking.guestEmail}</p>
        {booking.guestPhone && (
          <p className="text-white/60">{booking.guestPhone}</p>
        )}
        <p className="mt-4 text-violet-300">
          {formatDateTime(booking.startsAt, locale, booking.userTimezone)}
        </p>
        <p className="mt-2 text-sm text-white/40">{t(booking.status)}</p>
        {booking.guestNotes && (
          <p className="mt-4 rounded-xl bg-white/5 p-4 text-white/70">
            {booking.guestNotes}
          </p>
        )}
      </Card>
      <Card>
        <BookingActions booking={booking} />
      </Card>
    </div>
  );
}
