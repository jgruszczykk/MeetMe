import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getClients } from "@/lib/actions";

export default async function ClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const clients = await getClients(sp.search);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("clients")}</h1>
      <div className="space-y-2">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/${locale}/admin/clients/${c.id}`}
            className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:border-violet-400/50"
          >
            <p className="font-medium text-white">{c.name}</p>
            <p className="text-sm text-white/50">{c.email}</p>
            {c.tags.length > 0 && (
              <div className="mt-2 flex gap-2">
                {c.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
