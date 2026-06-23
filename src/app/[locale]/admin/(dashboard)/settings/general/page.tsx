import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAdminDashboardData } from "@/lib/actions";
import { SettingsForm } from "./settings-form";

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const data = await getAdminDashboardData();
  if (!data?.settings) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("general")}</h1>
      <SettingsForm hostId={data.host.id} settings={data.settings} />
    </div>
  );
}
