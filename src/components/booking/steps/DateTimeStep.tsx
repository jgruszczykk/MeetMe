"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SlotCalendarPicker } from "@/components/booking/SlotCalendarPicker";

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
  const dates = Object.keys(slotsByDate).sort();
  const times = selectedDate ? slotsByDate[selectedDate] ?? [] : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-72 rounded-2xl bg-white/5" />
          <div className="h-32 rounded-2xl bg-white/5" />
        </div>
      ) : (
        <SlotCalendarPicker
          dates={dates}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          times={times}
          selectedTime={selectedTime}
          onSelectTime={onSelectTime}
        />
      )}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button
          disabled={!selectedDate || !selectedTime || loading}
          onClick={onNext}
          size="lg"
          data-testid="step-next"
        >
          →
        </Button>
      </div>
    </motion.div>
  );
}
