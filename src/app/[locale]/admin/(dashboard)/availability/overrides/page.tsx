import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAdminDashboardData } from "@/lib/actions";
import { OverrideForm } from "./override-form";

export default async function OverridesPage({
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
      <h1 className="text-2xl font-bold text-white">{t("overrides")}</h1>
      <OverrideForm hostId={data.host.id} />
      <ul className="space-y-2">
        {data.overrides.map((o) => (
          <li key={o.id} className="rounded-xl bg-white/5 p-4 text-white/80">
            {o.date}: {o.startTime?.slice(0, 5)} – {o.endTime?.slice(0, 5)}
          </li>
        ))}
      </ul>
    </div>
  );
}
