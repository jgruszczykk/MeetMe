import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <article className="prose prose-invert mx-auto max-w-3xl px-4 py-16">
      <h1>{t("privacyTitle")}</h1>
      <p>{t("privacyIntro")}</p>
      <h2>{t("dataCollected")}</h2>
      <p>{t("dataCollectedBody")}</p>
      <h2>{t("dataUsage")}</h2>
      <p>{t("dataUsageBody")}</p>
      <h2>{t("contact")}</h2>
      <p>{t("contactBody")}</p>
      <Link href={`/${locale}`} className="text-violet-400">
        ← {t("backHome")}
      </Link>
    </article>
  );
}
