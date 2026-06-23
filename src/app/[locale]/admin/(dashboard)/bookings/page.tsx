import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BookingTable } from "@/components/admin/BookingTable";
import { getBookings, exportBookingsCsv } from "@/lib/actions";
import { ExportButton } from "./export-button";
import { SearchForm } from "./search-form";

export default async function BookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const status = sp.status ?? "pending";
  const bookings = await getBookings({
    status: status === "all" ? undefined : status,
    search: sp.search,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{t("bookings")}</h1>
        <ExportButton />
      </div>
      <SearchForm defaultStatus={status} defaultSearch={sp.search ?? ""} />
      <BookingTable bookings={bookings} locale={locale} />
    </div>
  );
}
