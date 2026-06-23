import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAdminDashboardData } from "@/lib/actions";
import { DurationsManager } from "./durations-manager";

export default async function DurationsPage({
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
      <h1 className="text-2xl font-bold text-white">{t("durations")}</h1>
      <DurationsManager hostId={data.host.id} durations={data.durations} />
    </div>
  );
}
