import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { getAdminDashboardData } from "@/lib/actions";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const data = await getAdminDashboardData();
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("calendar")}</h1>
      <AdminCalendar bookings={data.bookings} locale={locale} />
    </div>
  );
}
