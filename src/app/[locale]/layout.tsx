import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Link from "next/link";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "pl" | "en")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href={`/${locale}`} className="text-xl font-bold text-white">
            MeetMe
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href={`/${locale}/book`} className="text-white/70 hover:text-white">
              Book
            </Link>
            <Link href={`/${locale}/admin`} className="text-white/70 hover:text-white">
              Admin
            </Link>
            {routing.locales.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                className={l === locale ? "text-violet-400" : "text-white/40"}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </NextIntlClientProvider>
  );
}
