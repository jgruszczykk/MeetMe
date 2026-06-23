"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { meetingDurations } from "@/lib/db/schema";

type Duration = typeof meetingDurations.$inferSelect;

export function DurationStep({
  durations,
  selected,
  onSelect,
  onNext,
}: {
  durations: Duration[];
  selected?: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  const t = useTranslations("booking");

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-white md:text-center">{t("stepDuration")}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {durations.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            data-testid={`duration-${d.minutes}`}
            className={`rounded-2xl border p-6 text-left transition-all hover:scale-[1.02] ${
              selected === d.id
                ? "border-violet-400 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                : "border-white/10 bg-white/5 hover:border-violet-400/50"
            }`}
          >
            <p className="text-3xl font-bold text-white">{d.minutes}</p>
            <p className="text-sm text-white/60">{d.label}</p>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button disabled={!selected} onClick={onNext} size="lg" data-testid="step-next">
          →
        </Button>
      </div>
    </motion.div>
  );
}
