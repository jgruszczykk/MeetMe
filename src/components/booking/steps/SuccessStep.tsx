"use client";

import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Calendar, CheckCircle2 } from "lucide-react";

export function WowReveal({
  guestName,
  startsAt,
  timeZone,
  locale,
}: {
  guestName: string;
  startsAt: Date;
  timeZone: string;
  locale: string;
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

  const when = new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(startsAt);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-full max-w-md rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 p-8 shadow-2xl shadow-violet-500/20 backdrop-blur-xl"
        data-testid="booking-success"
      >
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
        <h2 className="mt-6 text-3xl font-bold text-white">{t("successTitle")}</h2>
        <p className="mt-4 text-white/80">{t("successMessage")}</p>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white/10 p-4">
          <Calendar className="h-5 w-5 text-violet-300" />
          <div className="text-left">
            <p className="font-medium text-white">{guestName}</p>
            <p className="text-sm text-white/70">{when}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-white/50">{t("successSubtext")}</p>
      </motion.div>
    </motion.div>
  );
}
