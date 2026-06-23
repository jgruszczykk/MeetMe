"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { upsertDuration } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { meetingDurations } from "@/lib/db/schema";

type Duration = typeof meetingDurations.$inferSelect;

export function DurationsManager({
  hostId,
  durations,
}: {
  hostId: string;
  durations: Duration[];
}) {
  const t = useTranslations("admin");
  const [minutes, setMinutes] = useState(30);
  const [label, setLabel] = useState("30 min");

  const add = async () => {
    await upsertDuration(hostId, { minutes, label, isActive: true, sortOrder: durations.length });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Minutes</Label>
          <Input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-2" />
        </div>
        <div>
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-2" />
        </div>
        <div className="flex items-end">
          <Button onClick={add} className="w-full">{t("addDuration")}</Button>
        </div>
      </div>
      <ul className="space-y-2">
        {durations.map((d) => (
          <li key={d.id} className="rounded-xl bg-white/5 p-4 text-white">
            {d.label} ({d.minutes} min)
          </li>
        ))}
      </ul>
    </div>
  );
}
