"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, Mail, MapPin, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatDurationDisplay } from "@/lib/booking/duration";
import type { MeetingType } from "@/lib/booking/meetingType";
import type { IntakeQuestion, locations, meetingDurations } from "@/lib/db/schema";
import { formatIntakeAnswer, getIntakeLabel } from "@/lib/intake/labels";

type Duration = typeof meetingDurations.$inferSelect;
type Location = typeof locations.$inferSelect;

type SummaryItem = {
  key: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
};

export function LiveSummaryCard({
  meetingType,
  duration,
  locationType,
  location,
  customMeetingPlace,
  intakeQuestions,
  intakeAnswers,
  selectedDate,
  selectedTime,
  guestName,
  guestEmail,
  currentStep,
  totalSteps,
  collapsed,
  onToggle,
}: {
  meetingType?: MeetingType;
  duration?: Duration;
  locationType?: "online" | "phone" | "in_person";
  location?: Location;
  customMeetingPlace?: string;
  intakeQuestions: IntakeQuestion[];
  intakeAnswers: Record<string, string | string[]>;
  selectedDate?: string;
  selectedTime?: string;
  guestName?: string;
  guestEmail?: string;
  currentStep: number;
  totalSteps: number;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();

  const locationLabels = {
    online: t("locationOnline"),
    phone: t("locationPhone"),
    in_person: t("locationInPerson"),
  };

  const meetingTypeLabels: Record<MeetingType, string> = {
    business: t("meetingTypeBusiness"),
    social: t("meetingTypeSocial"),
  };

  const items: SummaryItem[] = [];

  if (meetingType) {
    items.push({
      key: "meetingType",
      label: t("summaryMeetingType"),
      value: meetingTypeLabels[meetingType],
    });
  }

  if (duration) {
    items.push({
      key: "duration",
      label: t("summaryDuration"),
      value: formatDurationDisplay(duration.minutes, duration.label, locale),
      icon: <Clock className="h-4 w-4" />,
    });
  }

  if (locationType) {
    const locValue = location?.label ?? locationLabels[locationType];
    items.push({
      key: "location",
      label: t("summaryLocation"),
      value: locValue,
      icon: <MapPin className="h-4 w-4" />,
    });
  }

  if (customMeetingPlace?.trim()) {
    items.push({
      key: "meetingPlace",
      label: t("summaryLocationDetail"),
      value: customMeetingPlace.trim(),
      icon: <MapPin className="h-4 w-4" />,
    });
  }

  for (const question of intakeQuestions) {
    const answer = formatIntakeAnswer(question, intakeAnswers[question.key], locale);
    if (answer) {
      items.push({
        key: `intake-${question.key}`,
        label: getIntakeLabel(question, locale),
        value: answer,
      });
    }
  }

  if (selectedDate && selectedTime) {
    const when = new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(`${selectedDate}T${selectedTime}:00`));
    items.push({
      key: "datetime",
      label: t("summaryDateTime"),
      value: when,
      icon: <Calendar className="h-4 w-4" />,
    });
  }

  if (guestName) {
    items.push({
      key: "contact",
      label: t("name"),
      value: guestName,
      icon: <User className="h-4 w-4" />,
    });
  }

  if (guestEmail) {
    items.push({
      key: "email",
      label: t("email"),
      value: guestEmail,
      icon: <Mail className="h-4 w-4" />,
    });
  }

  const content = (
    <div className="space-y-1">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-300/80">
          {t("yourRequest")}
        </p>
        <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs text-violet-200">
          {t("stepOf", { current: currentStep, total: totalSteps })}
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-white/40"
          >
            {t("summaryEmpty")}
          </motion.p>
        ) : (
          items.map((item, i) => (
            <motion.div
              key={item.key}
              layout
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 text-xs text-white/50">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
              <p className="mt-0.5 truncate text-sm font-medium text-white">{item.value}</p>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );

  if (onToggle !== undefined) {
    return (
      <div className="border-t border-white/10 bg-[#0d0b14]/95 backdrop-blur-xl">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-white">{t("yourRequest")}</span>
          <span className="text-xs text-violet-300">
            {t("stepOf", { current: currentStep, total: totalSteps })}
            <span className="ml-2">{collapsed ? "▲" : "▼"}</span>
          </span>
        </button>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-4"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="sticky top-8 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 p-5 shadow-xl shadow-violet-500/5 backdrop-blur-xl"
    >
      {content}
    </motion.div>
  );
}
