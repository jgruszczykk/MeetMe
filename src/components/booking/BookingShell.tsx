"use client";

import { motion } from "framer-motion";

export function BookingShell({
  heading,
  children,
  summary,
  mobileSummary,
}: {
  heading?: React.ReactNode;
  children: React.ReactNode;
  summary?: React.ReactNode;
  mobileSummary?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 md:py-12 lg:pb-12">
      {heading && <div className="mb-8 md:mb-10">{heading}</div>}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
          {children}
        </motion.div>
        <aside className="hidden lg:block">{summary}</aside>
      </div>
      {mobileSummary && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">{mobileSummary}</div>
      )}
    </div>
  );
}
