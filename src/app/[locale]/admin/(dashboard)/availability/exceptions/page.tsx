import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAdminDashboardData } from "@/lib/actions";
import { ExceptionForm } from "./exception-form";

export default async function ExceptionsPage({
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
      <h1 className="text-2xl font-bold text-white">{t("exceptions")}</h1>
      <ExceptionForm hostId={data.host.id} />
      <ul className="space-y-2">
        {data.exceptions.map((e) => (
          <li key={e.id} className="rounded-xl bg-white/5 p-4 text-white/80">
            {e.date} {e.note && `— ${e.note}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
