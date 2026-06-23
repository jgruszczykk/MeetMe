import { getDefaultHostSlug } from "@/lib/actions";

export async function getDefaultBookingPath(locale: string): Promise<string> {
  let slug = "default";
  try {
    slug = await getDefaultHostSlug();
  } catch {
    slug = "default";
  }
  return `/${locale}/book/${slug}`;
}
