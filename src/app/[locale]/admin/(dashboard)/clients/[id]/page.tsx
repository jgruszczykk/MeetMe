import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/actions";
import { ClientProfileForm } from "./client-form";
import { formatDateTime } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const data = await getClientById(id);
  if (!data) notFound();

  const { client, bookings, emails } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{client.name}</h1>
        <p className="text-white/60">{client.email}</p>
      </div>
      <ClientProfileForm
        clientId={client.id}
        notes={client.notes ?? ""}
        tags={client.tags.join(", ")}
      />
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">{t("emailHistory")}</h2>
        <ul className="space-y-2">
          {emails.map((e) => (
            <li key={e.id} className="rounded-xl bg-white/5 p-4 text-sm text-white/70">
              <span className="text-violet-300">{e.type}</span> → {e.recipient}{" "}
              <span className="text-white/40">({e.status})</span>
            </li>
          ))}
          {emails.length === 0 && (
            <li className="text-white/40">No emails yet</li>
          )}
        </ul>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">{t("bookingHistory")}</h2>
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-xl bg-white/5 p-4 text-white/80">
              {formatDateTime(b.startsAt, locale, b.userTimezone)} — {b.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
