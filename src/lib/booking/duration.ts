export function formatDurationDisplay(
  minutes: number,
  label?: string | null,
  locale: string = "en",
): string {
  const custom = label?.trim();
  if (custom) return custom;

  const loc = locale === "pl" ? "pl" : "en";
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    if (loc === "pl") {
      if (hours === 1) return "1 godzina";
      if (hours >= 2 && hours <= 4) return `${hours} godziny`;
      return `${hours} godz.`;
    }
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  return `${minutes} min`;
}
