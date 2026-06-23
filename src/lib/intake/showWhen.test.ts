import { describe, expect, it } from "vitest";
import { evaluateShowWhen, filterVisibleIntakeQuestions } from "./showWhen";
import type { IntakeQuestion } from "@/lib/db/schema";

const baseQuestion = {
  id: "q1",
  hostId: "h1",
  key: "guest_phone",
  type: "phone" as const,
  labelPl: "Telefon",
  labelEn: "Phone",
  placeholderPl: null,
  placeholderEn: null,
  options: null,
  required: true,
  sortOrder: 0,
  isActive: true,
  showWhen: { locationType: "phone" },
};

describe("evaluateShowWhen", () => {
  it("returns true when showWhen is null", () => {
    expect(evaluateShowWhen(null, { locationType: "online" })).toBe(true);
  });

  it("matches locationType condition", () => {
    expect(evaluateShowWhen({ locationType: "phone" }, { locationType: "phone" })).toBe(true);
    expect(evaluateShowWhen({ locationType: "phone" }, { locationType: "online" })).toBe(false);
  });

  it("matches meetingType condition", () => {
    expect(evaluateShowWhen({ meetingType: "social" }, { meetingType: "social" })).toBe(true);
    expect(evaluateShowWhen({ meetingType: "social" }, { meetingType: "business" })).toBe(false);
  });
});

describe("filterVisibleIntakeQuestions", () => {
  it("filters by showWhen and isActive", () => {
    const questions = [
      baseQuestion,
      { ...baseQuestion, id: "q2", key: "company", showWhen: null, isActive: false },
    ] as IntakeQuestion[];

    const visible = filterVisibleIntakeQuestions(questions, { locationType: "phone" });
    expect(visible).toHaveLength(1);
    expect(visible[0].key).toBe("guest_phone");
  });
});
