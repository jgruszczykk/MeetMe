import { Resend } from "resend";
import { formatDateTime } from "@/lib/utils";
import type { Booking } from "@/lib/db/schema";

export type EmailType =
  | "request_received"
  | "new_booking_admin"
  | "confirmed"
  | "cancelled_by_admin"
  | "cancelled_by_user"
  | "reminder_24h"
  | "reminder_1h";

type EmailMessages = {
  requestReceivedSubject: string;
  requestReceivedBody: string;
  confirmedSubject: string;
  confirmedBody: string;
  cancelledSubject: string;
  cancelledBody: string;
  reminder24hSubject: string;
  reminder1hSubject: string;
  newBookingAdminSubject: string;
  cancelLink: string;
};

const messages: Record<"pl" | "en", EmailMessages> = {
  pl: {
    requestReceivedSubject: "Przyjęto wniosek o spotkanie",
    requestReceivedBody: "Twój wniosek o spotkanie został przyjęty i oczekuje na potwierdzenie.",
    confirmedSubject: "Spotkanie potwierdzone",
    confirmedBody: "Twoja rezerwacja została potwierdzona. Do zobaczenia!",
    cancelledSubject: "Rezerwacja anulowana",
    cancelledBody: "Twoja rezerwacja została anulowana.",
    reminder24hSubject: "Przypomnienie: spotkanie jutro",
    reminder1hSubject: "Przypomnienie: spotkanie za godzinę",
    newBookingAdminSubject: "Nowa rezerwacja do potwierdzenia",
    cancelLink: "Anuluj rezerwację",
  },
  en: {
    requestReceivedSubject: "Meeting request received",
    requestReceivedBody: "Your meeting request has been received and is awaiting confirmation.",
    confirmedSubject: "Meeting confirmed",
    confirmedBody: "Your booking has been confirmed. See you soon!",
    cancelledSubject: "Booking cancelled",
    cancelledBody: "Your booking has been cancelled.",
    reminder24hSubject: "Reminder: meeting tomorrow",
    reminder1hSubject: "Reminder: meeting in 1 hour",
    newBookingAdminSubject: "New booking to confirm",
    cancelLink: "Cancel booking",
  },
};

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function buildIcs(booking: Booking, locale: "pl" | "en"): string {
  const start = booking.startsAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = booking.endsAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MeetMe//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@meetme`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${locale === "pl" ? "Spotkanie MeetMe" : "MeetMe Meeting"}`,
    `DESCRIPTION:${booking.guestNotes ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
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
  },
): Promise<{ id?: string; status: string }> {
  const resend = getResend();
  const m = messages[locale];
  const appUrl = options?.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const when = formatDateTime(booking.startsAt, locale, booking.userTimezone);

  let subject = "";
  let html = "";
  let to = booking.guestEmail;
  const attachments: { filename: string; content: string }[] = [];

  switch (type) {
    case "request_received":
      subject = m.requestReceivedSubject;
      html = `<p>${m.requestReceivedBody}</p><p><strong>${when}</strong></p>${
        options?.cancelUrl
          ? `<p><a href="${options.cancelUrl}">${m.cancelLink}</a></p>`
          : ""
      }`;
      break;
    case "new_booking_admin":
      subject = m.newBookingAdminSubject;
      to = options?.adminEmail ?? booking.guestEmail;
      html = `<p>${booking.guestName} — ${booking.guestEmail}</p><p>${when}</p><p><a href="${appUrl}/${locale}/admin/bookings/${booking.id}">View in admin</a></p>`;
      break;
    case "confirmed":
      subject = m.confirmedSubject;
      html = `<p>${m.confirmedBody}</p><p><strong>${when}</strong></p>`;
      attachments.push({
        filename: "meeting.ics",
        content: Buffer.from(buildIcs(booking, locale)).toString("base64"),
      });
      break;
    case "cancelled_by_admin":
    case "cancelled_by_user":
      subject = m.cancelledSubject;
      html = `<p>${m.cancelledBody}</p>${options?.reason ? `<p>${options.reason}</p>` : ""}`;
      break;
    case "reminder_24h":
      subject = m.reminder24hSubject;
      html = `<p>${when}</p>`;
      break;
    case "reminder_1h":
      subject = m.reminder1hSubject;
      html = `<p>${when}</p>`;
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
