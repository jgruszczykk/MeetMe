"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Mail, MapPin, Pencil, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatDurationDisplay } from "@/lib/booking/duration";
import type { MeetingType } from "@/lib/booking/meetingType";
import type { IntakeQuestion, locations, meetingDurations } from "@/lib/db/schema";
import { formatIntakeAnswer, getIntakeLabel } from "@/lib/intake/labels";

type Duration = typeof meetingDurations.$inferSelect;
type Location = typeof locations.$inferSelect;

type ReviewSection = {
  stepId: string;
  label: string;
  value: string;
  icon: React.ReactNode;
};

export function ReviewStep({
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
  onEdit,
  onNext,
  onBack,
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
  onEdit: (stepId: string) => void;
  onNext: () => void;
  onBack: () => void;
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

  const sections: ReviewSection[] = [];

  if (meetingType) {
    sections.push({
      stepId: "meetingType",
      label: t("summaryMeetingType"),
      value: meetingTypeLabels[meetingType],
      icon: <Pencil className="h-4 w-4" />,
    });
  }

  if (duration) {
    sections.push({
      stepId: "duration",
      label: t("summaryDuration"),
      value: formatDurationDisplay(duration.minutes, duration.label, locale),
      icon: <Clock className="h-4 w-4" />,
    });
  }

  if (locationType) {
    sections.push({
      stepId: "location",
      label: t("summaryLocation"),
      value: location?.label ?? locationLabels[locationType],
      icon: <MapPin className="h-4 w-4" />,
    });
  }

  if (customMeetingPlace?.trim()) {
    sections.push({
      stepId: "locationDetail",
      label: t("summaryLocationDetail"),
      value: customMeetingPlace.trim(),
      icon: <MapPin className="h-4 w-4" />,
    });
  }

  for (const question of intakeQuestions) {
    const answer = formatIntakeAnswer(question, intakeAnswers[question.key], locale);
    if (answer) {
      sections.push({
        stepId: `intake-${question.id}`,
        label: getIntakeLabel(question, locale),
        value: answer,
        icon: <Pencil className="h-4 w-4" />,
      });
    }
  }

  if (selectedDate && selectedTime) {
    const when = new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-US", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(`${selectedDate}T${selectedTime}:00`));
    sections.push({
      stepId: "datetime",
      label: t("summaryDateTime"),
      value: when,
      icon: <Calendar className="h-4 w-4" />,
    });
  }

  if (guestName) {
    sections.push({
      stepId: "contact",
      label: t("name"),
      value: guestName,
      icon: <User className="h-4 w-4" />,
    });
  }

  if (guestEmail) {
    sections.push({
      stepId: "contact",
      label: t("email"),
      value: guestEmail,
      icon: <Mail className="h-4 w-4" />,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ rotateY: -8, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-600/15 to-fuchsia-600/10 p-6 shadow-2xl shadow-violet-500/10"
      >
        <div className="space-y-3">
          {sections.map((section, i) => (
            <motion.div
              key={`${section.stepId}-${section.label}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  {section.icon}
                  <span>{section.label}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white">{section.value}</p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(section.stepId)}
                className="shrink-0 text-xs text-violet-300 opacity-70 transition-opacity hover:opacity-100"
              >
                {t("editStep")}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ←
        </Button>
        <Button onClick={onNext} size="lg" data-testid="review-continue">
          →
        </Button>
      </div>
    </motion.div>
  );
}
