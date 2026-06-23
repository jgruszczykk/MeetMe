import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getDefaultBookingPath } from "@/lib/booking/defaultHost";

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(await getDefaultBookingPath(locale));
}
