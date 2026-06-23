"use client";

import { useTranslations } from "next-intl";

export function TimeTilePicker({
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

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm text-white/60">{t("selectDate")}</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.slice(0, 14).map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              data-testid={`date-${date}`}
              className={`shrink-0 rounded-xl px-4 py-3 text-sm ${
                selectedDate === date
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-white/80"
              }`}
            >
              {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </button>
          ))}
        </div>
      </div>
      {selectedDate && (
        <div>
          <p className="mb-3 text-sm text-white/60">{t("selectTime")}</p>
          {times.length === 0 ? (
            <p className="text-white/50">{t("noSlots")}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {times.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onSelectTime(time)}
                  data-testid={`time-${time.replace(":", "")}`}
                  className={`rounded-xl py-4 text-lg font-medium ${
                    selectedTime === time
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
