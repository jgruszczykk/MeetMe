"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { upsertOverride } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function OverrideForm({ hostId }: { hostId: string }) {
  const t = useTranslations("admin");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");

  const add = async () => {
    await upsertOverride(hostId, { date, startTime, endTime });
    window.location.reload();
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
      </div>
      <div>
        <Label>{t("startTime")}</Label>
        <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-2" />
      </div>
      <div>
        <Label>{t("endTime")}</Label>
        <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-2" />
      </div>
      <div className="flex items-end">
        <Button onClick={add} className="w-full">{t("addOverride")}</Button>
      </div>
    </div>
  );
}
