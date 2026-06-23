"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { upsertException } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ExceptionForm({ hostId }: { hostId: string }) {
  const t = useTranslations("admin");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const add = async () => {
    await upsertException(hostId, { date, isBlocked: true, note });
    window.location.reload();
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
      </div>
      <div>
        <Label>Note</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-2" />
      </div>
      <div className="flex items-end">
        <Button onClick={add} className="w-full">{t("addException")}</Button>
      </div>
    </div>
  );
}
