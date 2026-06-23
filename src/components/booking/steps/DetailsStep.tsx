"use client";

import { motion } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AssistantAvatar } from "@/components/booking/AssistantAvatar";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function DetailsStep({
  values,
  onChange,
  onSubmit,
  onBack,
  submitting,
}: {
  values: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestNotes: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: (turnstileToken: string) => void;
  onBack: () => void;
  submitting?: boolean;
}) {
  const t = useTranslations("booking");
  const [token, setToken] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <AssistantAvatar message={t("stepDetails")} />
      <h2 className="hidden text-2xl font-semibold text-white md:block md:text-center">
        {t("stepDetails")}
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            data-testid="guest-name"
            value={values.guestName}
            onChange={(e) => onChange("guestName", e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            data-testid="guest-email"
            value={values.guestEmail}
            onChange={(e) => onChange("guestEmail", e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            value={values.guestPhone}
            onChange={(e) => onChange("guestPhone", e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea
            id="notes"
            value={values.guestNotes}
            onChange={(e) => onChange("guestNotes", e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA"}
            onSuccess={setToken}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button
          disabled={!values.guestName || !values.guestEmail || !token || submitting}
          onClick={() => onSubmit(token)}
          size="lg"
          data-testid="submit-booking"
        >
          {submitting ? "..." : t("submit")}
        </Button>
      </div>
    </motion.div>
  );
}
