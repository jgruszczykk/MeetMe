"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export function BookingLinkCard({ locale, slug }: { locale: string; slug: string }) {
  const t = useTranslations("admin");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const bookingUrl = `${baseUrl}/${locale}/book/${slug}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [bookingUrl]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold text-white">{t("bookingLink")}</h2>
      <p className="mt-1 text-sm text-white/50">
        {t("slug")}: <span className="font-mono text-violet-300">{slug}</span>
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80">
          {bookingUrl}
        </code>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "✓" : t("copyLink")}
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t("openLink")}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
