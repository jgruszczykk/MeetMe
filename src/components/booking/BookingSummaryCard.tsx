"use client";

import { motion } from "framer-motion";
import type { BookingSummaryItem } from "@/lib/booking/summary";

export function BookingSummaryCard({
  items,
  title,
  subtitle,
  statusLabel,
  testId,
}: {
  items: BookingSummaryItem[];
  title: string;
  subtitle?: string;
  statusLabel?: string;
  testId?: string;
}) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="w-full max-w-md rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 p-8 shadow-2xl shadow-violet-500/20 backdrop-blur-xl"
      data-testid={testId}
    >
      {statusLabel && (
        <span className="mb-4 inline-block rounded-full bg-violet-500/25 px-3 py-1 text-xs font-semibold text-violet-200">
          {statusLabel}
        </span>
      )}
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {subtitle && <p className="mt-3 text-white/80">{subtitle}</p>}
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-left"
          >
            <p className="text-xs uppercase tracking-wide text-white/50">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
