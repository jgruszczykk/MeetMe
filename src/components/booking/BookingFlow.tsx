"use client";

import { AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookingShell } from "@/components/booking/BookingShell";
import { LiveSummaryCard } from "@/components/booking/LiveSummaryCard";
import { QuestionHeading } from "@/components/booking/QuestionHeading";
import { MeetingTypeStep } from "@/components/booking/steps/MeetingTypeStep";
import { ContactStep } from "@/components/booking/steps/ContactStep";
import { DateTimeStep } from "@/components/booking/steps/DateTimeStep";
import { DurationStep } from "@/components/booking/steps/DurationStep";
import { IntakeStep } from "@/components/booking/steps/IntakeStep";
import { LocationDetailStep } from "@/components/booking/steps/LocationDetailStep";
import { LocationStep } from "@/components/booking/steps/LocationStep";
import { ReviewStep } from "@/components/booking/steps/ReviewStep";
import { WowReveal } from "@/components/booking/steps/SuccessStep";
import { SubmitStep } from "@/components/booking/steps/SubmitStep";
import { createBooking, fetchAvailableSlots } from "@/lib/actions";
import type { hosts, intakeQuestions, locations, meetingDurations } from "@/lib/db/schema";
import { buildBookingSummaryItems } from "@/lib/booking/summary";
import type { MeetingType } from "@/lib/booking/meetingType";
import type { BookingSummaryItem } from "@/lib/booking/summary";
import { getIntakeLabel } from "@/lib/intake/labels";
import { filterVisibleIntakeQuestions } from "@/lib/intake/showWhen";
import { getUserTimezone, combineDateAndTimeInZone } from "@/lib/slots/timezone";

type Host = typeof hosts.$inferSelect;
type Duration = typeof meetingDurations.$inferSelect;
type Location = typeof locations.$inferSelect;
type IntakeQuestion = typeof intakeQuestions.$inferSelect;

const CUSTOM_LOCATION_ID = "custom";

type StepId =
  | "meetingType"
  | "duration"
  | "location"
  | "locationDetail"
  | `intake-${string}`
  | "datetime"
  | "contact"
  | "review"
  | "submit"
  | "success";

function buildStepOrder(visibleIntake: IntakeQuestion[]): StepId[] {
  const steps: StepId[] = ["meetingType", "duration", "location", "locationDetail"];
  for (const q of visibleIntake) {
    steps.push(`intake-${q.id}`);
  }
  steps.push("datetime", "contact", "review", "submit");
  return steps;
}

export function BookingFlow({
  host,
  durations,
  locations: locs,
  intakeQuestions: allIntakeQuestions,
}: {
  host: Host;
  durations: Duration[];
  locations: Location[];
  intakeQuestions: IntakeQuestion[];
}) {
  const locale = useLocale();
  const t = useTranslations("booking");
  const [stepId, setStepId] = useState<StepId>("meetingType");
  const [meetingType, setMeetingType] = useState<MeetingType>();
  const [durationId, setDurationId] = useState<string>();
  const [locationType, setLocationType] = useState<"online" | "phone" | "in_person">();
  const [locationId, setLocationId] = useState<string>();
  const [customMeetingPlace, setCustomMeetingPlace] = useState("");
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [successSummary, setSuccessSummary] = useState<BookingSummaryItem[]>([]);
  const [contact, setContact] = useState({ guestName: "", guestEmail: "" });

  const userTimezone = getUserTimezone();

  const visibleIntake = useMemo(
    () => filterVisibleIntakeQuestions(allIntakeQuestions, { locationType, meetingType }),
    [allIntakeQuestions, locationType, meetingType],
  );

  const stepOrder = useMemo(() => buildStepOrder(visibleIntake), [visibleIntake]);
  const currentStepIndex = stepId === "success" ? stepOrder.length : stepOrder.indexOf(stepId) + 1;
  const totalSteps = stepOrder.length;

  const selectedDuration = durations.find((d) => d.id === durationId);
  const selectedLocation =
    locationId && locationId !== CUSTOM_LOCATION_ID
      ? locs.find((l) => l.id === locationId)
      : undefined;

  const goNext = useCallback(() => {
    const idx = stepOrder.indexOf(stepId);
    if (idx >= 0 && idx < stepOrder.length - 1) {
      setStepId(stepOrder[idx + 1]);
    }
  }, [stepId, stepOrder]);

  const goBack = useCallback(() => {
    const idx = stepOrder.indexOf(stepId);
    if (idx > 0) {
      setStepId(stepOrder[idx - 1]);
    }
  }, [stepId, stepOrder]);

  const goToStep = useCallback((target: string) => {
    setStepId(target as StepId);
  }, []);

  const loadSlots = useCallback(async () => {
    if (!durationId) return;
    setLoadingSlots(true);
    try {
      const slots = await fetchAvailableSlots(host.id, durationId, userTimezone);
      setSlotsByDate(slots);
    } finally {
      setLoadingSlots(false);
    }
  }, [durationId, host.id, userTimezone]);

  useEffect(() => {
    if (stepId === "datetime" && durationId) {
      loadSlots();
    }
  }, [stepId, durationId, loadSlots]);

  const handleMeetingTypeSelect = (type: MeetingType) => {
    setMeetingType(type);
    setIntakeAnswers((prev) => {
      const visibleKeys = new Set(
        filterVisibleIntakeQuestions(allIntakeQuestions, { locationType, meetingType: type }).map(
          (q) => q.key,
        ),
      );
      return Object.fromEntries(Object.entries(prev).filter(([k]) => visibleKeys.has(k)));
    });
  };

  const handleLocationSelect = (type: "online" | "phone" | "in_person") => {
    setLocationType(type);
    const loc = locs.find((l) => l.type === type);
    setLocationId(loc?.id);
    setCustomMeetingPlace("");
    setIntakeAnswers((prev) => {
      const visibleKeys = new Set(
        filterVisibleIntakeQuestions(allIntakeQuestions, { locationType: type, meetingType }).map(
          (q) => q.key,
        ),
      );
      return Object.fromEntries(Object.entries(prev).filter(([k]) => visibleKeys.has(k)));
    });
  };

  const handleIntakeChange = (key: string, value: string | string[]) => {
    setIntakeAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const currentIntakeQuestion = stepId.startsWith("intake-")
    ? visibleIntake.find((q) => `intake-${q.id}` === stepId)
    : undefined;

  const intakeIndex = currentIntakeQuestion
    ? visibleIntake.indexOf(currentIntakeQuestion) + 1
    : 0;

  const getHeading = (): string => {
    switch (stepId) {
      case "meetingType":
        return t("stepMeetingType");
      case "duration":
        return t("stepDuration");
      case "location":
        return t("stepLocation");
      case "locationDetail":
        return t("stepLocationDetail");
      case "datetime":
        return t("stepDateTime");
      case "contact":
        return t("stepContact");
      case "review":
        return t("reviewTitle");
      case "submit":
        return t("submit");
      default:
        if (currentIntakeQuestion) {
          return getIntakeLabel(currentIntakeQuestion, locale);
        }
        return "";
    }
  };

  const handleSubmit = async (turnstileToken: string) => {
    if (!meetingType || !durationId || !locationType || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const startsAt = combineDateAndTimeInZone(selectedDate, selectedTime, userTimezone);
      const guestPhone =
        typeof intakeAnswers.guest_phone === "string" ? intakeAnswers.guest_phone : undefined;

      const responses: Record<string, string | string[]> = {
        meeting_type: meetingType,
      };
      if (customMeetingPlace.trim()) {
        responses.meeting_place = customMeetingPlace.trim();
      }
      for (const q of visibleIntake) {
        const val = intakeAnswers[q.key];
        if (val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0)) {
          responses[q.key] = val;
        }
      }

      const effectiveLocationId =
        locationId === CUSTOM_LOCATION_ID
          ? locs.find((l) => l.type === locationType)?.id
          : locationId;

      await createBooking({
        hostId: host.id,
        durationId,
        locationId: effectiveLocationId,
        locationType,
        startsAt: startsAt.toISOString(),
        userTimezone,
        locale: locale as "pl" | "en",
        guestName: contact.guestName,
        guestEmail: contact.guestEmail,
        guestPhone,
        intakeResponses: responses,
        turnstileToken,
      });

      setSuccessSummary(
        buildBookingSummaryItems({
          locale,
          meetingType,
          durationMinutes: selectedDuration?.minutes,
          durationLabel: selectedDuration?.label,
          locationType,
          locationLabel: selectedLocation?.label,
          customMeetingPlace: customMeetingPlace.trim() || undefined,
          intakeQuestions: visibleIntake,
          intakeAnswers: responses,
          startsAt,
          userTimezone,
          guestName: contact.guestName,
          guestEmail: contact.guestEmail,
        }),
      );
      setStepId("success");
    } catch (e) {
      console.error(e);
      alert("Error creating booking");
    } finally {
      setSubmitting(false);
    }
  };

  const summaryCard = (
    <LiveSummaryCard
      meetingType={meetingType}
      duration={selectedDuration}
      locationType={locationType}
      location={selectedLocation}
      customMeetingPlace={customMeetingPlace}
      intakeQuestions={visibleIntake}
      intakeAnswers={intakeAnswers}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      guestName={contact.guestName}
      guestEmail={contact.guestEmail}
      currentStep={currentStepIndex}
      totalSteps={totalSteps}
    />
  );

  const mobileSummary = (
    <LiveSummaryCard
      meetingType={meetingType}
      duration={selectedDuration}
      locationType={locationType}
      location={selectedLocation}
      customMeetingPlace={customMeetingPlace}
      intakeQuestions={visibleIntake}
      intakeAnswers={intakeAnswers}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      guestName={contact.guestName}
      guestEmail={contact.guestEmail}
      currentStep={currentStepIndex}
      totalSteps={totalSteps}
      collapsed={!mobileSummaryOpen}
      onToggle={() => setMobileSummaryOpen((o) => !o)}
    />
  );

  if (stepId === "success" && successSummary.length > 0) {
    return <WowReveal summaryItems={successSummary} />;
  }

  return (
    <BookingShell
      heading={<QuestionHeading>{getHeading()}</QuestionHeading>}
      summary={summaryCard}
      mobileSummary={mobileSummary}
    >
      <AnimatePresence mode="wait">
        {stepId === "meetingType" && (
          <MeetingTypeStep
            key="meetingType"
            selected={meetingType}
            onSelect={handleMeetingTypeSelect}
            onNext={goNext}
          />
        )}
        {stepId === "duration" && (
          <DurationStep
            key="duration"
            durations={durations}
            selected={durationId}
            onSelect={setDurationId}
            onNext={goNext}
          />
        )}
        {stepId === "location" && (
          <LocationStep
            key="location"
            selected={locationType}
            onSelect={handleLocationSelect}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {stepId === "locationDetail" && locationType && (
          <LocationDetailStep
            key="locationDetail"
            locationType={locationType}
            locations={locs}
            selectedId={locationId}
            customPlace={customMeetingPlace}
            onSelect={setLocationId}
            onCustomPlaceChange={setCustomMeetingPlace}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentIntakeQuestion && (
          <IntakeStep
            key={stepId}
            question={currentIntakeQuestion}
            value={intakeAnswers[currentIntakeQuestion.key]}
            onChange={(v) => handleIntakeChange(currentIntakeQuestion.key, v)}
            onNext={goNext}
            onBack={goBack}
            questionIndex={intakeIndex}
            questionTotal={visibleIntake.length}
          />
        )}
        {stepId === "datetime" && (
          <DateTimeStep
            key="datetime"
            slotsByDate={slotsByDate}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
            onNext={goNext}
            onBack={goBack}
            loading={loadingSlots}
          />
        )}
        {stepId === "contact" && (
          <ContactStep
            key="contact"
            guestName={contact.guestName}
            guestEmail={contact.guestEmail}
            onChange={(field, value) => setContact((c) => ({ ...c, [field]: value }))}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {stepId === "review" && (
          <ReviewStep
            key="review"
            meetingType={meetingType}
            customMeetingPlace={customMeetingPlace}
            duration={selectedDuration}
            locationType={locationType}
            location={selectedLocation}
            intakeQuestions={visibleIntake}
            intakeAnswers={intakeAnswers}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            guestName={contact.guestName}
            guestEmail={contact.guestEmail}
            onEdit={goToStep}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {stepId === "submit" && (
          <SubmitStep
            key="submit"
            onSubmit={handleSubmit}
            onBack={goBack}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </BookingShell>
  );
}
