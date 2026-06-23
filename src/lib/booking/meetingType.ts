export type MeetingType = "business" | "social";

export const MEETING_TYPES: MeetingType[] = ["business", "social"];

const labels: Record<"pl" | "en", Record<MeetingType, string>> = {
  pl: { business: "Biznesowe", social: "Towarzyskie" },
  en: { business: "Business", social: "Social" },
};

export function getMeetingTypeLabel(type: MeetingType, locale: string): string {
  return labels[locale === "pl" ? "pl" : "en"][type];
}

export function isMeetingType(value: unknown): value is MeetingType {
  return value === "business" || value === "social";
}
