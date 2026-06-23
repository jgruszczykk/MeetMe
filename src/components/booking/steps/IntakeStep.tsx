"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { IntakeQuestion } from "@/lib/db/schema";
import {
  getIntakeLabel,
  getIntakePlaceholder,
  getOptionLabel,
  parseIntakeOptions,
} from "@/lib/intake/labels";

export function IntakeStep({
  question,
  value,
  onChange,
  onNext,
  onBack,
  questionIndex,
  questionTotal,
}: {
  question: IntakeQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  questionIndex: number;
  questionTotal: number;
}) {
  const locale = useLocale();
  const label = getIntakeLabel(question, locale);
  const placeholder = getIntakePlaceholder(question, locale);
  const options = parseIntakeOptions(question);

  const isValid = () => {
    if (!question.required) return true;
    if (question.type === "multiselect") {
      return Array.isArray(value) && value.length > 0;
    }
    return typeof value === "string" && value.trim().length > 0;
  };

  const toggleMultiselect = (optValue: string) => {
    const current = Array.isArray(value) ? value : [];
    if (current.includes(optValue)) {
      onChange(current.filter((v) => v !== optValue));
    } else {
      onChange([...current, optValue]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      <p className="text-sm text-violet-300/70">
        {questionIndex} / {questionTotal}
      </p>

      {question.type === "select" || question.type === "multiselect" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((opt) => {
            const selected =
              question.type === "multiselect"
                ? Array.isArray(value) && value.includes(opt.value)
                : value === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                layout
                onClick={() =>
                  question.type === "multiselect"
                    ? toggleMultiselect(opt.value)
                    : onChange(opt.value)
                }
                data-testid={`intake-${question.key}-${opt.value}`}
                className={`relative flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center transition-all hover:scale-[1.02] ${
                  selected
                    ? "border-violet-400 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                    : "border-white/10 bg-white/5 hover:border-violet-400/50"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId={`intake-check-${question.key}`}
                    className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500"
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </motion.span>
                )}
                {opt.emoji && <span className="text-3xl leading-none">{opt.emoji}</span>}
                <span className="text-lg font-medium text-white">
                  {getOptionLabel(opt, locale)}
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : question.type === "textarea" ? (
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={`intake-${question.key}`}
          className="min-h-[40vh] text-base md:min-h-[50vh] md:text-lg"
          autoFocus
        />
      ) : (
        <Input
          type={
            question.type === "email"
              ? "email"
              : question.type === "phone"
                ? "tel"
                : "text"
          }
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? label}
          data-testid={`intake-${question.key}`}
          className="h-14 text-base md:h-16 md:text-lg"
          autoFocus
        />
      )}

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button disabled={!isValid()} onClick={onNext} size="lg" data-testid="step-next">
          →
        </Button>
      </div>
    </motion.div>
  );
}
