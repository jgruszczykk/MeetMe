"use client";

import { motion } from "framer-motion";

export function QuestionHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl"
    >
      {children}
    </motion.h1>
  );
}
