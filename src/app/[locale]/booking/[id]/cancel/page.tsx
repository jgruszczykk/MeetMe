"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { use, useState } from "react";
import { cancelBooking } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default function CancelBookingPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("bookingStatus");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelBooking(id, { byUser: true, token });
      setDone(true);
    } catch {
      setError(true);
    }
  };

  if (done) {
    return (
      <div className="p-8 text-center">
        <p className="text-emerald-400">{t("cancelSuccess")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">{t("cannotCancel")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-bold text-white">{t("cancelTitle")}</h1>
      <p className="mt-4 text-white/60">{t("cancelConfirm")}</p>
      <Button variant="destructive" className="mt-6" onClick={handleCancel}>
        {t("cancelTitle")}
      </Button>
    </div>
  );
}
