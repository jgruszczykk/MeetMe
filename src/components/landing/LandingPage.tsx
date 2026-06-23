import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Calendar, Clock, Globe, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const featureIcons = [Zap, Globe, Shield, Clock, Calendar, Sparkles];

export async function LandingPage({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  const features = t.raw("features") as Array<{ title: string; description: string }>;
  const faqs = t.raw("faq") as Array<{ question: string; answer: string }>;

  return (
    <>
      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute top-32 right-0 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl" />
        </div>
        <div className="relative mb-8 inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1 text-sm text-violet-300">
          MeetMe
        </div>
        <h1 className="relative text-5xl font-bold tracking-tight text-white md:text-6xl">
          {t("title")}
        </h1>
        <p className="relative mt-6 max-w-2xl text-lg text-white/60">{t("subtitle")}</p>
        <Link href={`/${locale}/book`} className="relative mt-10">
          <Button size="lg" data-testid="landing-cta">
            {t("cta")}
          </Button>
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">{t("featuresTitle")}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = featureIcons[i] ?? Sparkles;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <Icon className="mb-4 h-8 w-8 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/60">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">{t("faqTitle")}</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <summary className="cursor-pointer font-medium text-white marker:content-none">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-white/60">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">{t("ctaTitle")}</h2>
        <p className="mt-4 text-white/60">{t("ctaSubtitle")}</p>
        <Link href={`/${locale}/book`} className="mt-8 inline-block">
          <Button size="lg">{t("cta")}</Button>
        </Link>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/40">
        <div className="flex justify-center gap-6">
          <Link href={`/${locale}/privacy`} className="hover:text-white/70">
            {t("privacy")}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-white/70">
            {t("terms")}
          </Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} MeetMe</p>
      </footer>
    </>
  );
}
