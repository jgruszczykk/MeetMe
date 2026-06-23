"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS, pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

function toDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function SlotCalendarPicker({
  dates,
  selectedDate,
  onSelectDate,
  times,
  selectedTime,
  onSelectTime,
}: {
  dates: string[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  times: string[];
  selectedTime?: string;
  onSelectTime: (time: string) => void;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const dateFnsLocale = locale === "pl" ? pl : enUS;

  const availableSet = useMemo(() => new Set(dates), [dates]);

  const firstAvailable = dates[0] ? parseISO(dates[0]) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(firstAvailable));

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(startOfMonth(parseISO(selectedDate)));
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekdays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return format(day, "EEE", { locale: dateFnsLocale });
    });
  }, [dateFnsLocale]);

  const canGoPrev = useMemo(() => {
    const prev = subMonths(visibleMonth, 1);
    return dates.some((d) => isSameMonth(parseISO(d), prev));
  }, [dates, visibleMonth]);

  const canGoNext = useMemo(() => {
    const next = addMonths(visibleMonth, 1);
    return dates.some((d) => isSameMonth(parseISO(d), next));
  }, [dates, visibleMonth]);

  const selectedLabel = selectedDate
    ? format(parseISO(selectedDate), "EEEE, d MMMM", { locale: dateFnsLocale })
    : null;

  if (dates.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-white/60">{t("noSlotsAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
            disabled={!canGoPrev}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/80 transition hover:bg-white/10 disabled:opacity-30"
            aria-label={t("prevMonth")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-base font-semibold capitalize text-white sm:text-lg">
            {format(visibleMonth, "LLLL yyyy", { locale: dateFnsLocale })}
          </p>
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            disabled={!canGoNext}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/80 transition hover:bg-white/10 disabled:opacity-30"
            aria-label={t("nextMonth")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekdays.map((label) => (
            <div
              key={label}
              className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-white/40 sm:text-xs"
            >
              {label}
            </div>
          ))}
          <AnimatePresence mode="popLayout">
            {days.map((day) => {
              const dateStr = toDateStr(day);
              const inMonth = isSameMonth(day, visibleMonth);
              const available = availableSet.has(dateStr);
              const selected = selectedDate === dateStr;
              const today = isToday(day);

              return (
                <motion.button
                  key={dateStr}
                  type="button"
                  layout
                  disabled={!available}
                  onClick={() => {
                    onSelectDate(dateStr);
                    onSelectTime("");
                  }}
                  data-testid={available ? `date-${dateStr}` : undefined}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition sm:rounded-2xl sm:text-base ${
                    !inMonth
                      ? "text-white/15"
                      : available
                        ? selected
                          ? "bg-violet-600 font-semibold text-white shadow-lg shadow-violet-600/30"
                          : today
                            ? "bg-violet-500/20 text-white ring-1 ring-violet-400/50 hover:bg-violet-500/30"
                            : "bg-white/5 text-white hover:bg-white/10"
                        : "cursor-not-allowed text-white/20"
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  {available && inMonth && !selected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-violet-400 sm:bottom-1.5" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        {!selectedDate ? (
          <p className="text-center text-sm text-white/50">{t("pickDateFirst")}</p>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-white/60">{t("selectTime")}</p>
              {selectedLabel && (
                <p className="text-sm capitalize text-violet-300">{selectedLabel}</p>
              )}
            </div>
            {times.length === 0 ? (
              <p className="text-center text-sm text-white/50">{t("noSlots")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelectTime(time)}
                    data-testid={`time-${time.replace(":", "")}`}
                    className={`rounded-xl py-3 text-sm font-medium transition sm:py-3.5 sm:text-base ${
                      selectedTime === time
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                        : "bg-white/5 text-white/90 hover:bg-white/10"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
