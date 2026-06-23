"use client";

import { motion } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SubmitStep({
  onSubmit,
  onBack,
  submitting,
}: {
  onSubmit: (turnstileToken: string) => void;
  onBack: () => void;
  submitting?: boolean;
}) {
  const t = useTranslations("booking");
  const [token, setToken] = useState("");
  const isE2E = process.env.NEXT_PUBLIC_E2E === "true";

  useEffect(() => {
    if (isE2E) {
      setToken("e2e-bypass-token");
    }
  }, [isE2E]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="mx-auto max-w-lg space-y-8"
    >
      <p className="text-center text-white/60">{t("turnstileRequired")}</p>
      <div className="flex justify-center">
        {!isE2E && (
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA"}
            onSuccess={setToken}
          />
        )}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button
          disabled={!token || submitting}
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
