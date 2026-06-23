"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { upsertLocation } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { locations } from "@/lib/db/schema";

type Location = typeof locations.$inferSelect;

export function LocationsManager({
  hostId,
  locations: locs,
}: {
  hostId: string;
  locations: Location[];
}) {
  const t = useTranslations("admin");
  const [type, setType] = useState<"online" | "phone" | "in_person">("online");
  const [label, setLabel] = useState("");

  const add = async () => {
    await upsertLocation(hostId, { type, label, isActive: true });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
          >
            <option value="online">Online</option>
            <option value="phone">Phone</option>
            <option value="in_person">In person</option>
          </select>
        </div>
        <div>
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-2" />
        </div>
        <div className="flex items-end">
          <Button onClick={add} className="w-full">{t("addLocation")}</Button>
        </div>
      </div>
      <ul className="space-y-2">
        {locs.map((l) => (
          <li key={l.id} className="rounded-xl bg-white/5 p-4 text-white">
            {l.label} ({l.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
