"use client";

import { motion } from "framer-motion";
import { MapPin, Monitor, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const locationTypes = [
  { type: "online" as const, icon: Monitor },
  { type: "phone" as const, icon: Phone },
  { type: "in_person" as const, icon: MapPin },
];

export function LocationStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected?: string;
  onSelect: (type: "online" | "phone" | "in_person") => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("booking");

  const labels = {
    online: t("locationOnline"),
    phone: t("locationPhone"),
    in_person: t("locationInPerson"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-4"
    >
      {locationTypes.map(({ type, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            data-testid={`location-${type}`}
            className={`flex w-full items-center gap-4 rounded-2xl border p-5 transition-all ${
              selected === type
                ? "border-violet-400 bg-violet-500/20"
                : "border-white/10 bg-white/5 hover:border-violet-400/50"
            }`}
          >
            <Icon className="h-6 w-6 text-violet-300" />
            <span className="text-lg text-white">{labels[type]}</span>
          </button>
        ))}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button disabled={!selected} onClick={onNext} size="lg" data-testid="step-next">
          →
        </Button>
      </div>
    </motion.div>
  );
}
