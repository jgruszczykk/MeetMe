import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(
  date: Date,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(date);
}
