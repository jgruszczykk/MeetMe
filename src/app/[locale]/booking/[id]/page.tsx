import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getBookingById } from "@/lib/actions";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bookingStatus");

  let booking = null;
  try {
    booking = await getBookingById(id);
  } catch {
    booking = null;
  }

  if (!booking) {
    return <p className="p-8 text-center text-white/60">Not found</p>;
  }

  return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold text-white">{t(booking.status)}</h1>
      <p className="mt-4 text-white/70">
        {formatDateTime(booking.startsAt, locale, booking.userTimezone)}
      </p>
      {booking.status === "pending" && (
        <Link
          href={`/${locale}/booking/${id}/cancel?token=${booking.cancelToken}`}
          className="mt-6 inline-block text-red-400 hover:underline"
        >
          {t("cancelTitle")}
        </Link>
      )}
    </div>
  );
}
