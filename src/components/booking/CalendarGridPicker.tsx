"use client";

import { useTranslations } from "next-intl";

export function CalendarGridPicker({
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
    <div className="grid grid-cols-2 gap-8">
      <div>
        <p className="mb-4 text-sm font-medium text-white/60">{t("selectDate")}</p>
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              data-testid={`date-${date}`}
              className={`rounded-xl p-3 text-left text-sm ${
                selectedDate === date
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-4 text-sm font-medium text-white/60">{t("selectTime")}</p>
        {!selectedDate ? (
          <p className="text-white/40">← {t("selectDate")}</p>
        ) : times.length === 0 ? (
          <p className="text-white/50">{t("noSlots")}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {times.map((time) => (
              <button
                key={time}
                type="button"
                  onClick={() => onSelectTime(time)}
                  data-testid={`time-${time.replace(":", "")}`}
                className={`rounded-lg py-3 text-sm font-medium ${
                  selectedTime === time
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
