"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteDuration, upsertDuration } from "@/lib/actions";
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
  const tCommon = useTranslations("common");
  const [minutes, setMinutes] = useState(30);
  const [label, setLabel] = useState("30 min");

  const add = async () => {
    await upsertDuration(hostId, { minutes, label, isActive: true, sortOrder: durations.length });
    window.location.reload();
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("deleteDurationConfirm"))) return;

    const result = await deleteDuration(id);
    if (!result.ok) {
      alert(result.error === "in_use" ? t("durationInUse") : t("durationLast"));
      return;
    }

    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Minutes</Label>
          <Input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-2" />
        </div>
        <div className="flex items-end">
          <Button onClick={add} className="w-full">
            {t("addDuration")}
          </Button>
        </div>
      </div>
      <ul className="space-y-2">
        {durations.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-4 text-white"
          >
            <span>
              {d.label} ({d.minutes} min)
            </span>
            <Button type="button" variant="ghost" onClick={() => remove(d.id)}>
              {tCommon("delete")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
