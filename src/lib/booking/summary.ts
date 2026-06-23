import { formatDurationDisplay } from "@/lib/booking/duration";
import type { MeetingType } from "@/lib/booking/meetingType";
import { getMeetingTypeLabel, isMeetingType } from "@/lib/booking/meetingType";
import type { IntakeQuestion } from "@/lib/db/schema";
import { formatIntakeAnswer, getIntakeLabel } from "@/lib/intake/labels";

export type BookingSummaryItem = {
  key: string;
  label: string;
  value: string;
};

export type BookingSummaryInput = {
  locale: string;
  meetingType?: MeetingType;
  durationMinutes?: number;
  durationLabel?: string;
  locationType?: "online" | "phone" | "in_person";
  locationLabel?: string;
  customMeetingPlace?: string;
  intakeQuestions?: IntakeQuestion[];
  intakeAnswers?: Record<string, string | string[]>;
  startsAt?: Date;
  userTimezone?: string;
  guestName?: string;
  guestEmail?: string;
};

type SummaryLabels = {
  stepMeetingType: string;
  stepDuration: string;
  stepLocation: string;
  stepLocationDetail: string;
  stepDateTime: string;
  name: string;
  email: string;
  locationOnline: string;
  locationPhone: string;
  locationInPerson: string;
};

const labelsByLocale: Record<"pl" | "en", SummaryLabels> = {
  pl: {
    stepMeetingType: "Rodzaj spotkania",
    stepDuration: "Czas trwania",
    stepLocation: "Forma spotkania",
    stepLocationDetail: "Miejsce spotkania",
    stepDateTime: "Termin",
    name: "Imię i nazwisko",
    email: "Email",
    locationOnline: "Online",
    locationPhone: "Telefon",
    locationInPerson: "Na miejscu",
  },
  en: {
    stepMeetingType: "Meeting type",
    stepDuration: "Duration",
    stepLocation: "Meeting format",
    stepLocationDetail: "Meeting place",
    stepDateTime: "Date & time",
    name: "Name",
    email: "Email",
    locationOnline: "Online",
    locationPhone: "Phone",
    locationInPerson: "In person",
  },
};

export function getSummaryLabels(locale: string): SummaryLabels {
  return labelsByLocale[locale === "pl" ? "pl" : "en"];
}

export function buildBookingSummaryItems(input: BookingSummaryInput): BookingSummaryItem[] {
  const locale = input.locale === "pl" ? "pl" : "en";
  const t = getSummaryLabels(locale);
  const items: BookingSummaryItem[] = [];

  if (input.meetingType) {
    items.push({
      key: "meetingType",
      label: t.stepMeetingType,
      value: getMeetingTypeLabel(input.meetingType, locale),
    });
  }

  if (input.durationMinutes !== undefined) {
    items.push({
      key: "duration",
      label: t.stepDuration,
      value: formatDurationDisplay(input.durationMinutes, input.durationLabel, locale),
    });
  }

  if (input.locationType) {
    const locationLabels = {
      online: t.locationOnline,
      phone: t.locationPhone,
      in_person: t.locationInPerson,
    };
    items.push({
      key: "location",
      label: t.stepLocation,
      value: input.locationLabel ?? locationLabels[input.locationType],
    });
  }

  if (input.customMeetingPlace?.trim()) {
    items.push({
      key: "meetingPlace",
      label: t.stepLocationDetail,
      value: input.customMeetingPlace.trim(),
    });
  }

  const answers = input.intakeAnswers ?? {};
  for (const question of input.intakeQuestions ?? []) {
    if (question.key === "meeting_type" || question.key === "meeting_place") continue;
    const answer = formatIntakeAnswer(question, answers[question.key], locale);
    if (answer) {
      items.push({
        key: `intake-${question.key}`,
        label: getIntakeLabel(question, locale),
        value: answer,
      });
    }
  }

  if (input.startsAt) {
    const when = new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: input.userTimezone,
    }).format(input.startsAt);
    items.push({
      key: "datetime",
      label: t.stepDateTime,
      value: when,
    });
  }

  if (input.guestName) {
    items.push({ key: "contact", label: t.name, value: input.guestName });
  }

  if (input.guestEmail) {
    items.push({ key: "email", label: t.email, value: input.guestEmail });
  }

  return items;
}

export function getMeetingTypeFromResponses(
  responses: Record<string, string | string[]> | null | undefined,
): MeetingType | undefined {
  const value = responses?.meeting_type;
  return isMeetingType(value) ? value : undefined;
}

export function getMeetingPlaceFromResponses(
  responses: Record<string, string | string[]> | null | undefined,
): string | undefined {
  const value = responses?.meeting_place;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
