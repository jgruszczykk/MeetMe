"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateClientNotes } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ClientProfileForm({
  clientId,
  notes,
  tags,
}: {
  clientId: string;
  notes: string;
  tags: string;
}) {
  const t = useTranslations("admin");
  const [notesVal, setNotesVal] = useState(notes);
  const [tagsVal, setTagsVal] = useState(tags);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await updateClientNotes(
      clientId,
      notesVal,
      tagsVal.split(",").map((t) => t.trim()).filter(Boolean),
    );
    setSaved(true);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 p-6">
      <div>
        <Label>{t("tags")}</Label>
        <Input
          value={tagsVal}
          onChange={(e) => setTagsVal(e.target.value)}
          placeholder="VIP, lead"
          className="mt-2"
        />
      </div>
      <div>
        <Label>{t("clientNotes")}</Label>
        <Textarea
          value={notesVal}
          onChange={(e) => setNotesVal(e.target.value)}
          className="mt-2"
        />
      </div>
      <Button onClick={save}>{t("save")}</Button>
      {saved && <p className="text-sm text-emerald-400">Saved</p>}
    </div>
  );
}
