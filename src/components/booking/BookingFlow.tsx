"use client";

import { AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AssistantAvatar } from "@/components/booking/AssistantAvatar";
import { DateTimeStep } from "@/components/booking/steps/DateTimeStep";
import { DetailsStep } from "@/components/booking/steps/DetailsStep";
import { DurationStep } from "@/components/booking/steps/DurationStep";
import { LocationStep } from "@/components/booking/steps/LocationStep";
import { WowReveal } from "@/components/booking/steps/SuccessStep";
import { createBooking, fetchAvailableSlots } from "@/lib/actions";
import { getUserTimezone, combineDateAndTimeInZone } from "@/lib/slots/timezone";
import type { hosts, locations, meetingDurations } from "@/lib/db/schema";

type Host = typeof hosts.$inferSelect;
type Duration = typeof meetingDurations.$inferSelect;
type Location = typeof locations.$inferSelect;

type Step = "duration" | "location" | "datetime" | "details" | "success";

export function BookingFlow({
  host,
  durations,
  locations: locs,
}: {
  host: Host;
  durations: Duration[];
  locations: Location[];
}) {
  const locale = useLocale();
  const [step, setStep] = useState<Step>("duration");
  const [durationId, setDurationId] = useState<string>();
  const [locationType, setLocationType] = useState<"online" | "phone" | "in_person">();
  const [locationId, setLocationId] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    guestName: string;
    startsAt: Date;
  }>();
  const [details, setDetails] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestNotes: "",
  });

  const userTimezone = getUserTimezone();

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
    if (step === "datetime" && durationId) {
      loadSlots();
    }
  }, [step, durationId, loadSlots]);

  const handleLocationSelect = (type: "online" | "phone" | "in_person") => {
    setLocationType(type);
    const loc = locs.find((l) => l.type === type);
    setLocationId(loc?.id);
  };

  const handleSubmit = async (turnstileToken: string) => {
    if (!durationId || !locationType || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const startsAt = combineDateAndTimeInZone(
        selectedDate,
        selectedTime,
        userTimezone,
      );
      await createBooking({
        hostId: host.id,
        durationId,
        locationId,
        locationType,
        startsAt: startsAt.toISOString(),
        userTimezone,
        locale: locale as "pl" | "en",
        guestName: details.guestName,
        guestEmail: details.guestEmail,
        guestPhone: details.guestPhone || undefined,
        guestNotes: details.guestNotes || undefined,
        turnstileToken,
      });
      setBookingResult({ guestName: details.guestName, startsAt });
      setStep("success");
    } catch (e) {
      console.error(e);
      alert("Error creating booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {step !== "success" && <AssistantAvatar />}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {step === "duration" && (
            <DurationStep
              key="duration"
              durations={durations}
              selected={durationId}
              onSelect={setDurationId}
              onNext={() => setStep("location")}
            />
          )}
          {step === "location" && (
            <LocationStep
              key="location"
              selected={locationType}
              onSelect={handleLocationSelect}
              onNext={() => setStep("datetime")}
              onBack={() => setStep("duration")}
            />
          )}
          {step === "datetime" && (
            <DateTimeStep
              key="datetime"
              slotsByDate={slotsByDate}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={setSelectedDate}
              onSelectTime={setSelectedTime}
              onNext={() => setStep("details")}
              onBack={() => setStep("location")}
              loading={loadingSlots}
            />
          )}
          {step === "details" && (
            <DetailsStep
              key="details"
              values={details}
              onChange={(field, value) =>
                setDetails((d) => ({ ...d, [field]: value }))
              }
              onSubmit={handleSubmit}
              onBack={() => setStep("datetime")}
              submitting={submitting}
            />
          )}
          {step === "success" && bookingResult && (
            <WowReveal
              key="success"
              guestName={bookingResult.guestName}
              startsAt={bookingResult.startsAt}
              timeZone={userTimezone}
              locale={locale}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
