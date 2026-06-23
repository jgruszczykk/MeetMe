import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BookingActions } from "@/components/admin/BookingTable";
import { BookingActivityLog } from "@/components/admin/BookingActivityLog";
import { getBookingDetail } from "@/lib/actions";
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
  const tAdmin = await getTranslations("admin");

  const detail = await getBookingDetail(id);
  if (!detail) notFound();

  const { booking, events, emails, summaryItems } = detail;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{booking.guestName}</h1>
              <p className="mt-2 text-white/60">{booking.guestEmail}</p>
              {booking.guestPhone && <p className="text-white/60">{booking.guestPhone}</p>}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                booking.status === "pending"
                  ? "bg-amber-500/20 text-amber-300"
                  : booking.status === "confirmed"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/10 text-white/60"
              }`}
            >
              {t(booking.status)}
            </span>
          </div>
          <p className="mt-4 text-violet-300">
            {formatDateTime(booking.startsAt, locale, booking.userTimezone)}
          </p>
          {booking.guestNotes && (
            <p className="mt-4 rounded-xl bg-white/5 p-4 text-white/70">{booking.guestNotes}</p>
          )}
          {booking.cancelReason && (
            <p className="mt-4 rounded-xl bg-red-500/10 p-4 text-red-200">
              {booking.cancelReason}
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">{tAdmin("bookingSummary")}</h2>
          <dl className="mt-4 space-y-3">
            {summaryItems.map((item) => (
              <div key={item.key} className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-white/50">{item.label}</dt>
                <dd className="mt-1 text-sm font-medium text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">{tAdmin("activityLog")}</h2>
          <div className="mt-4">
            <BookingActivityLog
              events={events}
              emails={emails}
              locale={locale}
              timezone={booking.userTimezone}
            />
          </div>
        </Card>
      </div>

      <Card>
        <BookingActions booking={booking} />
      </Card>
    </div>
  );
}
