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
      className="grid gap-8 md:grid-cols-2"
    >
      <div className="hidden md:flex md:flex-col md:justify-center">
        <div className="rounded-3xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 p-12">
          <h2 className="text-3xl font-bold text-white">{t("stepLocation")}</h2>
          <p className="mt-4 text-white/60">Choose how you want to connect</p>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white md:hidden">{t("stepLocation")}</h2>
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
          <Button disabled={!selected} onClick={onNext} size="lg">
            →
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
