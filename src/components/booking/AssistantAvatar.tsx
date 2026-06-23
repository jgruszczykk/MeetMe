"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function AssistantAvatar({ message }: { message?: string }) {
  const t = useTranslations("booking");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 md:hidden"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
        <p className="mb-1 text-xs font-semibold text-violet-300">{t("assistantName")}</p>
        <p>{message ?? t("assistantGreeting")}</p>
      </div>
    </motion.div>
  );
}
