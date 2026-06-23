import type { IntakeQuestion } from "@/lib/db/schema";
import type { MeetingType } from "@/lib/booking/meetingType";

export type ShowWhenCondition = {
  locationType?: "online" | "phone" | "in_person";
  meetingType?: MeetingType;
};

export type ShowWhenContext = {
  locationType?: "online" | "phone" | "in_person";
  meetingType?: MeetingType;
};

export function evaluateShowWhen(
  showWhen: ShowWhenCondition | null | undefined,
  context: ShowWhenContext,
): boolean {
  if (!showWhen) return true;
  if (showWhen.locationType && context.locationType !== showWhen.locationType) {
    return false;
  }
  if (showWhen.meetingType && context.meetingType !== showWhen.meetingType) {
    return false;
  }
  return true;
}

export function filterVisibleIntakeQuestions(
  questions: IntakeQuestion[],
  context: ShowWhenContext,
): IntakeQuestion[] {
  return questions.filter(
    (q) => q.isActive && evaluateShowWhen(q.showWhen as ShowWhenCondition | null, context),
  );
}
