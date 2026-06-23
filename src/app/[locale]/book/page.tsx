import { setRequestLocale } from "next-intl/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { getBookingFlowData } from "@/lib/actions";

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let data = null;
  try {
    data = await getBookingFlowData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-white/60">
        <p>Database not configured. Set DATABASE_URL and run migrations + seed.</p>
      </div>
    );
  }

  return (
    <BookingFlow
      host={data.host}
      durations={data.durations}
      locations={data.locations}
    />
  );
}
