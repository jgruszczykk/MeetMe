"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateHostSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { hostSettings } from "@/lib/db/schema";

type Settings = typeof hostSettings.$inferSelect;

export function SettingsForm({
  hostId,
  settings,
}: {
  hostId: string;
  settings: Settings;
}) {
  const t = useTranslations("admin");
  const [form, setForm] = useState({
    minNoticeMinutes: settings.minNoticeMinutes,
    maxHorizonDays: settings.maxHorizonDays,
    dailyBookingLimit: settings.dailyBookingLimit,
    defaultBufferBefore: settings.defaultBufferBefore,
    defaultBufferAfter: settings.defaultBufferAfter,
    adminEmail: settings.adminEmail,
  });

  const save = async () => {
    await updateHostSettings(hostId, form);
    alert("Saved");
  };

  const fields = [
    { key: "minNoticeMinutes", label: t("minNotice") },
    { key: "maxHorizonDays", label: t("maxHorizon") },
    { key: "dailyBookingLimit", label: t("dailyLimit") },
    { key: "defaultBufferBefore", label: t("bufferBefore") },
    { key: "defaultBufferAfter", label: t("bufferAfter") },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <Label>{label}</Label>
          <Input
            type="number"
            value={form[key]}
            onChange={(e) =>
              setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
            }
            className="mt-2"
          />
        </div>
      ))}
      <div className="md:col-span-2">
        <Label>{t("adminEmail")}</Label>
        <Input
          type="email"
          value={form.adminEmail}
          onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
          className="mt-2"
        />
      </div>
      <Button onClick={save} className="md:col-span-2">
        {t("save")}
      </Button>
    </div>
  );
}
