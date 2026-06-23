"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CalendarGridPicker } from "@/components/booking/CalendarGridPicker";
import { TimeTilePicker } from "@/components/booking/TimeTilePicker";

export function DateTimeStep({
  slotsByDate,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
  loading,
}: {
  slotsByDate: Record<string, string[]>;
  selectedDate?: string;
  selectedTime?: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}) {
  const t = useTranslations("booking");
  const dates = Object.keys(slotsByDate);
  const times = selectedDate ? slotsByDate[selectedDate] ?? [] : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-white">{t("stepDateTime")}</h2>
      {loading ? (
        <p className="text-white/60">{t("selectDate")}...</p>
      ) : (
        <>
          <div className="hidden md:block">
            <CalendarGridPicker
              dates={dates}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              times={times}
              selectedTime={selectedTime}
              onSelectTime={onSelectTime}
            />
          </div>
          <div className="md:hidden">
            <TimeTilePicker
              dates={dates}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              times={times}
              selectedTime={selectedTime}
              onSelectTime={onSelectTime}
            />
          </div>
        </>
      )}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button disabled={!selectedDate || !selectedTime} onClick={onNext} size="lg">
          →
        </Button>
      </div>
    </motion.div>
  );
}
