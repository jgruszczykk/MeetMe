import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAdminDashboardData, getIntakeQuestions } from "@/lib/actions";
import { IntakeQuestionsManager } from "./intake-questions-manager";

export default async function IntakeSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.intake");
  const data = await getAdminDashboardData();
  if (!data) return null;

  const questions = await getIntakeQuestions(data.host.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="mt-2 text-white/60">{t("description")}</p>
      </div>
      <IntakeQuestionsManager hostId={data.host.id} questions={questions} />
    </div>
  );
}
