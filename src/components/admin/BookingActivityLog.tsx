import { useTranslations } from "next-intl";
import type { bookingEvents, emailLog } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/utils";

type BookingEvent = typeof bookingEvents.$inferSelect;
type EmailLog = typeof emailLog.$inferSelect;

export function BookingActivityLog({
  events,
  emails,
  locale,
  timezone = "Europe/Warsaw",
}: {
  events: BookingEvent[];
  emails: EmailLog[];
  locale: string;
  timezone?: string;
}) {
  const t = useTranslations("admin");
  const tStatus = useTranslations("bookingStatus");

  const linkedEmailIds = new Set(
    events.map((event) => event.emailLogId).filter((id): id is string => Boolean(id)),
  );

  const actorLabel = (actor: BookingEvent["actorType"]) => {
    if (actor === "admin") return t("actorAdmin");
    if (actor === "user") return t("actorUser");
    return t("actorSystem");
  };

  const emailTypeLabel = (type: string) => {
    const known = [
      "request_received",
      "new_booking_admin",
      "confirmed",
      "cancelled_by_admin",
      "cancelled_by_user",
      "reminder_24h",
      "reminder_1h",
    ] as const;
    if ((known as readonly string[]).includes(type)) {
      return t(`emailTypes.${type}` as `emailTypes.${(typeof known)[number]}`);
    }
    return type;
  };

  const describeEvent = (event: BookingEvent) => {
    if (!event.fromStatus) {
      return t("eventCreated");
    }
    const from = event.fromStatus ? tStatus(event.fromStatus) : "—";
    const to = tStatus(event.toStatus);
    const change = t("eventStatusChange", { from, to });
    const actor = t("eventActor", { actor: actorLabel(event.actorType) });
    return `${change} (${actor})`;
  };

  type TimelineEntry =
    | { kind: "event"; at: Date; event: BookingEvent; email?: EmailLog }
    | { kind: "email"; at: Date; email: EmailLog };

  const emailById = new Map(emails.map((email) => [email.id, email]));

  const timeline: TimelineEntry[] = [
    ...events.map((event) => ({
      kind: "event" as const,
      at: event.createdAt,
      event,
      email: event.emailLogId ? emailById.get(event.emailLogId) : undefined,
    })),
    ...emails
      .filter((email) => !linkedEmailIds.has(email.id))
      .map((email) => ({ kind: "email" as const, at: email.createdAt, email })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  if (timeline.length === 0) {
    return <p className="text-sm text-white/40">{t("activityEmpty")}</p>;
  }

  return (
    <ul className="space-y-3">
      {timeline.map((entry) => {
        if (entry.kind === "event") {
          const { event, email } = entry;
          return (
            <li key={`event-${event.id}`} className="rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs text-white/40">
                {formatDateTime(entry.at, locale, timezone)}
              </p>
              <p className="mt-1 text-sm text-white">{describeEvent(event)}</p>
              {event.reason && (
                <p className="mt-1 text-sm text-white/60">
                  {event.reason}
                </p>
              )}
              {email && (
                <p className="mt-2 text-sm text-violet-300">
                  {t("emailSent", {
                    type: emailTypeLabel(email.type),
                    recipient: email.recipient,
                  })}
                  <span className="text-white/40"> ({email.status})</span>
                </p>
              )}
            </li>
          );
        }

        return (
          <li key={`email-${entry.email.id}`} className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-white/40">
              {formatDateTime(entry.at, locale, "Europe/Warsaw")}
            </p>
            <p className="mt-1 text-sm text-violet-300">
              {t("emailSent", {
                type: emailTypeLabel(entry.email.type),
                recipient: entry.email.recipient,
              })}
              <span className="text-white/40"> ({entry.email.status})</span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
