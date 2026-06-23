"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { upsertAvailabilityRule } from "@/lib/actions";
import { useState } from "react";
import type { availabilityRules } from "@/lib/db/schema";

type Rule = typeof availabilityRules.$inferSelect;

export function AvailabilityRuleForm({
  hostId,
  rules,
}: {
  hostId: string;
  rules: Rule[];
}) {
  const t = useTranslations("admin");
  const tDays = useTranslations("days");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const add = async () => {
    await upsertAvailabilityRule(hostId, { dayOfWeek, startTime, endTime });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label>{t("dayOfWeek")}</Label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
          >
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <option key={d} value={d}>
                {tDays(String(d))}
              </option>
            ))}
          </select>
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
          <Button onClick={add} className="w-full">
            {t("addRule")}
          </Button>
        </div>
      </div>
      <ul className="space-y-2">
        {rules.map((r) => (
          <li key={r.id} className="rounded-xl bg-white/5 p-4 text-white/80">
            {tDays(String(r.dayOfWeek))}: {r.startTime?.slice(0, 5)} – {r.endTime?.slice(0, 5)}
          </li>
        ))}
      </ul>
    </div>
  );
}
