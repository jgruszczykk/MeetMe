import type { IntakeQuestion } from "@/lib/db/schema";
import { getMeetingTypeLabel, isMeetingType } from "@/lib/booking/meetingType";
import { getMeetingPlaceFromResponses } from "@/lib/booking/summary";
import { formatIntakeAnswer, getIntakeLabel } from "./labels";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatIntakeSummaryHtml(
  questions: IntakeQuestion[],
  responses: Record<string, string | string[]> | null | undefined,
  locale: "pl" | "en",
): string {
  if (!responses || Object.keys(responses).length === 0) return "";

  const items: string[] = [];

  const meetingType = responses.meeting_type;
  if (isMeetingType(meetingType)) {
    const typeLabel = locale === "pl" ? "Rodzaj spotkania" : "Meeting type";
    items.push(
      `<li><strong>${escapeHtml(typeLabel)}:</strong> ${escapeHtml(getMeetingTypeLabel(meetingType, locale))}</li>`,
    );
  }

  const meetingPlace = getMeetingPlaceFromResponses(responses);
  if (meetingPlace) {
    const placeLabel = locale === "pl" ? "Miejsce spotkania" : "Meeting place";
    items.push(
      `<li><strong>${escapeHtml(placeLabel)}:</strong> ${escapeHtml(meetingPlace)}</li>`,
    );
  }

  for (const q of questions) {
    const val = responses[q.key];
    if (q.key === "meeting_type" || q.key === "meeting_place") continue;
    if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
      continue;
    }
    const formatted = formatIntakeAnswer(q, val, locale);
    if (!formatted) continue;
    const label = escapeHtml(getIntakeLabel(q, locale));
    items.push(`<li><strong>${label}:</strong> ${escapeHtml(formatted)}</li>`);
  }

  if (items.length === 0) return "";
  return `<ul>${items.join("")}</ul>`;
}
