"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  deleteIntakeQuestion,
  reorderIntakeQuestions,
  upsertIntakeQuestion,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { IntakeQuestion } from "@/lib/db/schema";

type QuestionType = IntakeQuestion["type"];

type OptionDraft = { value: string; labelPl: string; labelEn: string; emoji: string };

const QUESTION_TYPES: QuestionType[] = [
  "select",
  "multiselect",
  "text",
  "textarea",
  "phone",
  "email",
];

const LOCATION_TYPES = ["online", "phone", "in_person"] as const;
const MEETING_TYPES = ["business", "social"] as const;

function emptyForm(sortOrder: number) {
  return {
    key: "",
    type: "text" as QuestionType,
    labelPl: "",
    labelEn: "",
    placeholderPl: "",
    placeholderEn: "",
    options: [] as OptionDraft[],
    required: false,
    sortOrder,
    isActive: true,
    showWhenLocationType: "" as "" | (typeof LOCATION_TYPES)[number],
    showWhenMeetingType: "" as "" | (typeof MEETING_TYPES)[number],
  };
}

function toForm(question: IntakeQuestion) {
  const showWhen = question.showWhen as {
    locationType?: string;
    meetingType?: string;
  } | null;
  return {
    key: question.key,
    type: question.type,
    labelPl: question.labelPl,
    labelEn: question.labelEn,
    placeholderPl: question.placeholderPl ?? "",
    placeholderEn: question.placeholderEn ?? "",
    options: ((question.options as OptionDraft[] | null) ?? []).map((o) => ({
      ...o,
      emoji: o.emoji ?? "",
    })),
    required: question.required,
    sortOrder: question.sortOrder,
    isActive: question.isActive,
    showWhenLocationType: (showWhen?.locationType ?? "") as
      | ""
      | (typeof LOCATION_TYPES)[number],
    showWhenMeetingType: (showWhen?.meetingType ?? "") as
      | ""
      | (typeof MEETING_TYPES)[number],
  };
}

function toPayload(form: ReturnType<typeof emptyForm>) {
  const showWhen =
    form.showWhenLocationType || form.showWhenMeetingType
      ? {
          ...(form.showWhenLocationType ? { locationType: form.showWhenLocationType } : {}),
          ...(form.showWhenMeetingType ? { meetingType: form.showWhenMeetingType } : {}),
        }
      : null;

  return {
    key: form.key,
    type: form.type,
    labelPl: form.labelPl,
    labelEn: form.labelEn,
    placeholderPl: form.placeholderPl || undefined,
    placeholderEn: form.placeholderEn || undefined,
    options:
      form.type === "select" || form.type === "multiselect"
        ? form.options.map((o) => ({
            value: o.value,
            labelPl: o.labelPl,
            labelEn: o.labelEn,
            ...(o.emoji.trim() ? { emoji: o.emoji.trim() } : {}),
          }))
        : undefined,
    required: form.required,
    sortOrder: form.sortOrder,
    isActive: form.isActive,
    showWhen,
  };
}

export function IntakeQuestionsManager({
  hostId,
  questions: initialQuestions,
}: {
  hostId: string;
  questions: IntakeQuestion[];
}) {
  const t = useTranslations("admin.intake");
  const [questions, setQuestions] = useState(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm(initialQuestions.length));
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm(questions.length));
  };

  const startEdit = (question: IntakeQuestion) => {
    setEditingId(question.id);
    setForm(toForm(question));
  };

  const save = async () => {
    setSaving(true);
    try {
      await upsertIntakeQuestion(hostId, toPayload(form), editingId ?? undefined);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    await deleteIntakeQuestion(id);
    window.location.reload();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const orderedIds = questions.map((q) => q.id);
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];
    await reorderIntakeQuestions(hostId, orderedIds);
    const reordered = [...questions];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setQuestions(reordered);
  };

  const addOption = () => {
    setForm((current) => ({
      ...current,
      options: [...current.options, { value: "", labelPl: "", labelEn: "", emoji: "" }],
    }));
  };

  const updateOption = (index: number, field: keyof OptionDraft, value: string) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  const removeOption = (index: number) => {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, i) => i !== index),
    }));
  };

  const needsOptions = form.type === "select" || form.type === "multiselect";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {editingId ? t("editQuestion") : t("addQuestion")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>{t("key")}</Label>
            <Input
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="mt-2"
              disabled={!!editingId}
            />
          </div>
          <div>
            <Label>{t("type")}</Label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as QuestionType })
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>{t("labelPl")}</Label>
            <Input
              value={form.labelPl}
              onChange={(e) => setForm({ ...form, labelPl: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>{t("labelEn")}</Label>
            <Input
              value={form.labelEn}
              onChange={(e) => setForm({ ...form, labelEn: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>{t("placeholderPl")}</Label>
            <Input
              value={form.placeholderPl}
              onChange={(e) => setForm({ ...form, placeholderPl: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>{t("placeholderEn")}</Label>
            <Input
              value={form.placeholderEn}
              onChange={(e) => setForm({ ...form, placeholderEn: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>{t("showWhen")}</Label>
            <select
              value={form.showWhenMeetingType}
              onChange={(e) =>
                setForm({
                  ...form,
                  showWhenMeetingType: e.target.value as typeof form.showWhenMeetingType,
                })
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
            >
              <option value="">{t("showWhenMeetingTypeAny")}</option>
              {MEETING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`meetingTypes.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>{t("showWhenLocation")}</Label>
            <select
              value={form.showWhenLocationType}
              onChange={(e) =>
                setForm({
                  ...form,
                  showWhenLocationType: e.target.value as typeof form.showWhenLocationType,
                })
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white"
            >
              <option value="">{t("showWhenAlways")}</option>
              {LOCATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`locationTypes.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm({ ...form, required: e.target.checked })}
              />
              {t("required")}
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              {t("active")}
            </label>
          </div>
        </div>

        {needsOptions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("options")}</Label>
              <Button type="button" variant="ghost" onClick={addOption}>
                {t("addOption")}
              </Button>
            </div>
            {form.options.map((option, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-5">
                <Input
                  placeholder={t("optionEmoji")}
                  value={option.emoji}
                  onChange={(e) => updateOption(index, "emoji", e.target.value)}
                  className="font-emoji"
                />
                <Input
                  placeholder={t("optionValue")}
                  value={option.value}
                  onChange={(e) => updateOption(index, "value", e.target.value)}
                />
                <Input
                  placeholder={t("optionLabelPl")}
                  value={option.labelPl}
                  onChange={(e) => updateOption(index, "labelPl", e.target.value)}
                />
                <Input
                  placeholder={t("optionLabelEn")}
                  value={option.labelEn}
                  onChange={(e) => updateOption(index, "labelEn", e.target.value)}
                />
                <Button type="button" variant="ghost" onClick={() => removeOption(index)}>
                  {t("removeOption")}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>
            {editingId ? t("saveQuestion") : t("addQuestion")}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              {t("cancelEdit")}
            </Button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {questions.length === 0 && (
          <li className="rounded-xl bg-white/5 p-4 text-white/60">{t("empty")}</li>
        )}
        {questions.map((question, index) => (
          <li
            key={question.id}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 p-4 text-white"
          >
            <span className="text-white/40">{question.sortOrder + 1}.</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {question.labelPl} / {question.labelEn}
              </p>
              <p className="text-sm text-white/60">
                {question.key} · {t(`types.${question.type}`)}
                {question.required ? ` · ${t("required")}` : ""}
                {!question.isActive ? ` · ${t("inactive")}` : ""}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={index === questions.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </Button>
              <Button type="button" variant="ghost" onClick={() => startEdit(question)}>
                {t("edit")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => remove(question.id)}>
                {t("delete")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
