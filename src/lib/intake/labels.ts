import type { IntakeQuestion } from "@/lib/db/schema";

export type IntakeQuestionOption = {
  value: string;
  labelPl: string;
  labelEn: string;
  emoji?: string;
};

export function getIntakeLabel(question: IntakeQuestion, locale: string): string {
  return locale === "pl" ? question.labelPl : question.labelEn;
}

export function getIntakePlaceholder(question: IntakeQuestion, locale: string): string | undefined {
  return locale === "pl" ? question.placeholderPl ?? undefined : question.placeholderEn ?? undefined;
}

export function getOptionLabel(option: IntakeQuestionOption, locale: string): string {
  return locale === "pl" ? option.labelPl : option.labelEn;
}

export function getOptionDisplayLabel(option: IntakeQuestionOption, locale: string): string {
  const label = getOptionLabel(option, locale);
  return option.emoji ? `${option.emoji} ${label}` : label;
}

export function parseIntakeOptions(question: IntakeQuestion): IntakeQuestionOption[] {
  if (!question.options || !Array.isArray(question.options)) return [];
  return question.options as IntakeQuestionOption[];
}

export function formatIntakeAnswer(
  question: IntakeQuestion,
  value: string | string[] | undefined,
  locale: string,
): string | undefined {
  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return undefined;
  }

  if (question.type === "select" || question.type === "multiselect") {
    const options = parseIntakeOptions(question);
    const values = Array.isArray(value) ? value : [value];
    return values
      .map((v) => {
        const opt = options.find((o) => o.value === v);
        return opt ? getOptionDisplayLabel(opt, locale) : v;
      })
      .join(", ");
  }

  return Array.isArray(value) ? value.join(", ") : value;
}
