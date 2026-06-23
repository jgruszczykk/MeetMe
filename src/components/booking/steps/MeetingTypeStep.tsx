"use client";

import { motion } from "framer-motion";
import { Briefcase, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { MeetingType } from "@/lib/booking/meetingType";

const types: { type: MeetingType; icon: typeof Briefcase }[] = [
  { type: "business", icon: Briefcase },
  { type: "social", icon: Users },
];

export function MeetingTypeStep({
  selected,
  onSelect,
  onNext,
}: {
  selected?: MeetingType;
  onSelect: (type: MeetingType) => void;
  onNext: () => void;
}) {
  const t = useTranslations("booking");

  const labels: Record<MeetingType, { title: string; description: string }> = {
    business: {
      title: t("meetingTypeBusiness"),
      description: t("meetingTypeBusinessDesc"),
    },
    social: {
      title: t("meetingTypeSocial"),
      description: t("meetingTypeSocialDesc"),
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {types.map(({ type, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            data-testid={`meeting-type-${type}`}
            className={`flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-all hover:scale-[1.02] ${
              selected === type
                ? "border-violet-400 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                : "border-white/10 bg-white/5 hover:border-violet-400/50"
            }`}
          >
            <Icon className="h-8 w-8 text-violet-300" />
            <div>
              <p className="text-xl font-semibold text-white">{labels[type].title}</p>
              <p className="mt-1 text-sm text-white/60">{labels[type].description}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <Button disabled={!selected} onClick={onNext} size="lg" data-testid="step-next">
          →
        </Button>
      </div>
    </motion.div>
  );
}
