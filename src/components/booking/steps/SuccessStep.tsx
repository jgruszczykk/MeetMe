"use client";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { BookingSummaryCard } from "@/components/booking/BookingSummaryCard";
import type { BookingSummaryItem } from "@/lib/booking/summary";

export function WowReveal({
  summaryItems,
}: {
  summaryItems: BookingSummaryItem[];
}) {
  const t = useTranslations("booking");

  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#8b5cf6", "#d946ef", "#ffffff"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#8b5cf6", "#d946ef", "#ffffff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <BookingSummaryCard
        items={summaryItems}
        title={t("successTitle")}
        subtitle={t("successMessage")}
        statusLabel={t("successStatusPending")}
        testId="booking-success"
      />
      <p className="mt-6 max-w-md text-sm text-white/50">{t("successSubtext")}</p>
    </motion.div>
  );
}
