import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { BookingLinkCard } from "@/components/admin/BookingLinkCard";
import { BookingTable } from "@/components/admin/BookingTable";
import { getAdminDashboardData } from "@/lib/actions";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const data = await getAdminDashboardData();
  if (!data) {
    return <p className="text-white/60">No data. Run seed.</p>;
  }

  const pending = data.bookings.filter((b) => b.status === "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("dashboard")}</h1>
        <p className="mt-2 text-white/60">
          {t("pendingCount")}:{" "}
          <span className="text-2xl font-bold text-amber-400">{data.pendingCount}</span>
        </p>
      </div>
      <BookingLinkCard locale={locale} slug={data.host.slug} />
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("filterPending")}</h2>
          <Link href={`/${locale}/admin/bookings`} className="text-sm text-violet-400">
            View all →
          </Link>
        </div>
        <BookingTable bookings={pending.slice(0, 5)} locale={locale} quickActions />
      </div>
    </div>
  );
}
