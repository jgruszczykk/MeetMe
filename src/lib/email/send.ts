import { Resend } from "resend";
import type { BookingSummaryItem } from "@/lib/booking/summary";
import type { Booking } from "@/lib/db/schema";
import { buildBookingCardEmailHtml, buildEmailLayout } from "@/lib/email/template";
import { buildBookingIcs } from "@/lib/email/ics";

export type EmailType =
  | "request_received"
  | "new_booking_admin"
  | "confirmed"
  | "cancelled_by_admin"
  | "cancelled_by_user"
  | "reminder_24h"
  | "reminder_1h";

type EmailCopy = {
  requestReceivedSubject: string;
  requestReceivedHeading: string;
  requestReceivedIntro: string;
  confirmedSubject: string;
  confirmedHeading: string;
  confirmedIntro: string;
  cancelledSubject: string;
  cancelledHeading: string;
  cancelledIntro: string;
  reminder24hSubject: string;
  reminder24hHeading: string;
  reminder24hIntro: string;
  reminder1hSubject: string;
  reminder1hHeading: string;
  reminder1hIntro: string;
  newBookingAdminSubject: string;
  newBookingAdminHeading: string;
  newBookingAdminIntro: string;
  cancelLink: string;
  viewInAdmin: string;
  statusPending: string;
  statusConfirmed: string;
  footer: string;
};

const copy: Record<"pl" | "en", EmailCopy> = {
  pl: {
    requestReceivedSubject: "Przyjęto wniosek o spotkanie",
    requestReceivedHeading: "Wniosek przyjęty!",
    requestReceivedIntro:
      "Twój wniosek o spotkanie został przyjęty i oczekuje na potwierdzenie. Poniżej karta z podsumowaniem — taką samą widzisz po wysłaniu zgłoszenia.",
    confirmedSubject: "Spotkanie potwierdzone",
    confirmedHeading: "Spotkanie potwierdzone!",
    confirmedIntro: "Twoja rezerwacja została potwierdzona. Do zobaczenia!",
    cancelledSubject: "Rezerwacja anulowana",
    cancelledHeading: "Rezerwacja anulowana",
    cancelledIntro: "Twoja rezerwacja została anulowana.",
    reminder24hSubject: "Przypomnienie: spotkanie jutro",
    reminder24hHeading: "Spotkanie już jutro",
    reminder24hIntro: "Przypominamy o zaplanowanym spotkaniu.",
    reminder1hSubject: "Przypomnienie: spotkanie za godzinę",
    reminder1hHeading: "Spotkanie za godzinę",
    reminder1hIntro: "Za chwilę Wasze spotkanie — poniżej szczegóły.",
    newBookingAdminSubject: "Nowa rezerwacja do potwierdzenia",
    newBookingAdminHeading: "Nowa rezerwacja",
    newBookingAdminIntro: "Pojawił się nowy wniosek o spotkanie. Potwierdź lub anuluj w panelu admina.",
    cancelLink: "Anuluj rezerwację",
    viewInAdmin: "Otwórz w panelu admina",
    statusPending: "Oczekuje na potwierdzenie",
    statusConfirmed: "Potwierdzone",
    footer: "MeetMe — umawianie spotkań",
  },
  en: {
    requestReceivedSubject: "Meeting request received",
    requestReceivedHeading: "Request received!",
    requestReceivedIntro:
      "Your meeting request has been received and is awaiting confirmation. Below is the same summary card you see after submitting.",
    confirmedSubject: "Meeting confirmed",
    confirmedHeading: "Meeting confirmed!",
    confirmedIntro: "Great news — your booking has been confirmed. See you soon!",
    cancelledSubject: "Booking cancelled",
    cancelledHeading: "Booking cancelled",
    cancelledIntro: "Your booking has been cancelled.",
    reminder24hSubject: "Reminder: meeting tomorrow",
    reminder24hHeading: "Meeting tomorrow",
    reminder24hIntro: "A quick reminder about your upcoming meeting.",
    reminder1hSubject: "Reminder: meeting in 1 hour",
    reminder1hHeading: "Meeting in 1 hour",
    reminder1hIntro: "Your meeting is coming up soon — details below.",
    newBookingAdminSubject: "New booking to confirm",
    newBookingAdminHeading: "New booking",
    newBookingAdminIntro: "A new meeting request is waiting for your review.",
    cancelLink: "Cancel booking",
    viewInAdmin: "Open in admin panel",
    statusPending: "Awaiting confirmation",
    statusConfirmed: "Confirmed",
    footer: "MeetMe — meeting scheduling",
  },
};

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendBookingEmail(
  type: EmailType,
  booking: Booking,
  locale: "pl" | "en",
  options?: {
    adminEmail?: string;
    cancelUrl?: string;
    reason?: string;
    appUrl?: string;
    summaryItems?: BookingSummaryItem[];
    icsLocationLine?: string;
    icsOnlineUrl?: string;
  },
): Promise<{ id?: string; status: string }> {
  const resend = getResend();
  const m = copy[locale];
  const appUrl = options?.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const items = options?.summaryItems ?? [];

  let subject = "";
  let html = "";
  let to = booking.guestEmail;
  const attachments: { filename: string; content: string }[] = [];

  const card = (statusLabel?: string, statusColor?: string) =>
    items.length > 0
      ? buildBookingCardEmailHtml(items, locale, { statusLabel, statusColor })
      : "";

  switch (type) {
    case "request_received":
      subject = m.requestReceivedSubject;
      html = buildEmailLayout({
        locale,
        preheader: m.requestReceivedIntro,
        heading: m.requestReceivedHeading,
        intro: m.requestReceivedIntro,
        cardHtml: card(m.statusPending, "#c4b5fd"),
        cta: options?.cancelUrl
          ? { label: m.cancelLink, href: options.cancelUrl }
          : undefined,
        footerHtml: `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">${m.footer}</p>`,
      });
      break;
    case "new_booking_admin":
      subject = m.newBookingAdminSubject;
      to = options?.adminEmail ?? booking.guestEmail;
      html = buildEmailLayout({
        locale,
        heading: m.newBookingAdminHeading,
        intro: `${m.newBookingAdminIntro} ${booking.guestName} — ${booking.guestEmail}`,
        cardHtml: card(m.statusPending, "#fbbf24"),
        cta: {
          label: m.viewInAdmin,
          href: `${appUrl}/${locale}/admin/bookings/${booking.id}`,
        },
        footerHtml: `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">${m.footer}</p>`,
      });
      break;
    case "confirmed":
      subject = m.confirmedSubject;
      html = buildEmailLayout({
        locale,
        heading: m.confirmedHeading,
        intro: m.confirmedIntro,
        cardHtml: card(m.statusConfirmed, "#34d399"),
        footerHtml: `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">${m.footer}</p>`,
      });
      attachments.push({
        filename: "meeting.ics",
        content: Buffer.from(
          buildBookingIcs({
            booking,
            locale,
            summaryItems: items,
            locationLine: options?.icsLocationLine,
            onlineUrl: options?.icsOnlineUrl,
          }),
        ).toString("base64"),
      });
      break;
    case "cancelled_by_admin":
    case "cancelled_by_user":
      subject = m.cancelledSubject;
      html = buildEmailLayout({
        locale,
        heading: m.cancelledHeading,
        intro: options?.reason ? `${m.cancelledIntro} ${options.reason}` : m.cancelledIntro,
        cardHtml: card(),
        footerHtml: `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">${m.footer}</p>`,
      });
      break;
    case "reminder_24h":
      subject = m.reminder24hSubject;
      html = buildEmailLayout({
        locale,
        heading: m.reminder24hHeading,
        intro: m.reminder24hIntro,
        cardHtml: card(m.statusConfirmed, "#34d399"),
        footerHtml: `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">${m.footer}</p>`,
      });
      break;
    case "reminder_1h":
      subject = m.reminder1hSubject;
      html = buildEmailLayout({
        locale,
        heading: m.reminder1hHeading,
        intro: m.reminder1hIntro,
        cardHtml: card(m.statusConfirmed, "#34d399"),
        footerHtml: `<p style="color:rgba(245,243,255,0.45);font-size:13px;text-align:center;margin-top:24px;">${m.footer}</p>`,
      });
      break;
  }

  if (!resend) {
    console.log(`[email mock] ${type} -> ${to}: ${subject}`);
    return { status: "mock" };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "MeetMe <onboarding@resend.dev>";
  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    attachments: attachments.length
      ? attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
        }))
      : undefined,
  });

  return { id: result.data?.id, status: result.error ? "failed" : "sent" };
}
