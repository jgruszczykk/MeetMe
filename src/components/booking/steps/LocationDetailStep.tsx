"use client";

import { motion } from "framer-motion";
import { MapPin, Monitor, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { locations } from "@/lib/db/schema";

type Location = typeof locations.$inferSelect;

const CUSTOM_LOCATION_ID = "custom";

export function LocationDetailStep({
  locationType,
  locations: locs,
  selectedId,
  customPlace,
  onSelect,
  onCustomPlaceChange,
  onNext,
  onBack,
}: {
  locationType: "online" | "phone" | "in_person";
  locations: Location[];
  selectedId?: string;
  customPlace: string;
  onSelect: (id: string | undefined) => void;
  onCustomPlaceChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("booking");
  const filtered = locs.filter((l) => l.type === locationType);
  const isCustom = selectedId === CUSTOM_LOCATION_ID;
  const customValid = customPlace.trim().length >= 3;

  const canProceed = () => {
    if (locationType === "in_person") {
      return isCustom ? customValid : !!selectedId;
    }
    return true;
  };

  const handleSelectPreset = (id: string) => {
    onSelect(id);
    if (id !== CUSTOM_LOCATION_ID) {
      onCustomPlaceChange("");
    }
  };

  const placeField = (
    <div className="space-y-2">
      <Label htmlFor="meeting-place">{t("customMeetingPlaceLabel")}</Label>
      <Input
        id="meeting-place"
        data-testid="meeting-place-custom"
        value={customPlace}
        onChange={(e) => {
          onCustomPlaceChange(e.target.value);
          if (locationType === "in_person" && e.target.value.trim()) {
            onSelect(CUSTOM_LOCATION_ID);
          }
        }}
        placeholder={t(`customMeetingPlacePlaceholder_${locationType}`)}
        className="h-14 text-base"
      />
      <p className="text-sm text-white/50">{t(`customMeetingPlaceHint_${locationType}`)}</p>
    </div>
  );

  if (locationType === "in_person") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        className="space-y-6"
      >
        {placeField}
        {filtered.length > 0 && (
          <>
            <p className="text-sm text-white/50">{t("orPickSuggestion")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((loc) => (
                <motion.button
                  key={loc.id}
                  type="button"
                  layout
                  onClick={() => handleSelectPreset(loc.id)}
                  data-testid={`location-detail-${loc.id}`}
                  className={`flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] ${
                    selectedId === loc.id
                      ? "border-violet-400 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                      : "border-white/10 bg-white/5 hover:border-violet-400/50"
                  }`}
                >
                  <MapPin className="h-5 w-5 text-violet-300" />
                  <span className="text-lg font-medium text-white">{loc.label}</span>
                  {loc.address && <span className="text-sm text-white/60">{loc.address}</span>}
                </motion.button>
              ))}
            </div>
          </>
        )}
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack}>
            ←
          </Button>
          <Button disabled={!canProceed()} onClick={onNext} size="lg" data-testid="step-next">
            →
          </Button>
        </div>
      </motion.div>
    );
  }

  const loc = filtered[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-8"
      >
        {locationType === "online" ? (
          <>
            <Monitor className="h-10 w-10 text-violet-300" />
            <p className="mt-4 text-lg text-white">{t("locationOnlineInfo")}</p>
            {loc?.onlineUrl && (
              <p className="mt-2 text-sm text-white/60">{loc.onlineUrl}</p>
            )}
          </>
        ) : (
          <>
            <Phone className="h-10 w-10 text-violet-300" />
            <p className="mt-4 text-lg text-white">{t("locationPhoneInfo")}</p>
            {loc?.phone && (
              <p className="mt-2 text-xl font-semibold text-violet-200">{loc.phone}</p>
            )}
          </>
        )}
      </motion.div>
      {placeField}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button
          onClick={() => {
            if (loc && !isCustom) onSelect(loc.id);
            onNext();
          }}
          size="lg"
          data-testid="step-next"
        >
          →
        </Button>
      </div>
    </motion.div>
  );
}
