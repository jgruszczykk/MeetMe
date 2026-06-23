import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <article className="prose prose-invert mx-auto max-w-3xl px-4 py-16">
      <h1>{t("termsTitle")}</h1>
      <p>{t("termsIntro")}</p>
      <h2>{t("bookingPolicy")}</h2>
      <p>{t("bookingPolicyBody")}</p>
      <h2>{t("cancellation")}</h2>
      <p>{t("cancellationBody")}</p>
      <Link href={`/${locale}`} className="text-violet-400">
        ← {t("backHome")}
      </Link>
    </article>
  );
}
