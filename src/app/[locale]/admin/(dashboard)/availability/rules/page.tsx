import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AvailabilityRuleForm } from "@/components/admin/AvailabilityRuleForm";
import { getAdminDashboardData } from "@/lib/actions";

export default async function AvailabilityRulesPage({
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
      <h1 className="text-2xl font-bold text-white">{t("rules")}</h1>
      <AvailabilityRuleForm hostId={data.host.id} rules={data.rules} />
    </div>
  );
}
