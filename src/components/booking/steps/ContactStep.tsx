"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ContactStep({
  guestName,
  guestEmail,
  onChange,
  onNext,
  onBack,
}: {
  guestName: string;
  guestEmail: string;
  onChange: (field: "guestName" | "guestEmail", value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("booking");
  const valid = guestName.trim().length >= 2 && guestEmail.includes("@");

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            data-testid="guest-name"
            value={guestName}
            onChange={(e) => onChange("guestName", e.target.value)}
            className="mt-2 h-14 text-base"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            data-testid="guest-email"
            value={guestEmail}
            onChange={(e) => onChange("guestEmail", e.target.value)}
            className="mt-2 h-14 text-base"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button disabled={!valid} onClick={onNext} size="lg" data-testid="step-next">
          →
        </Button>
      </div>
    </motion.div>
  );
}
