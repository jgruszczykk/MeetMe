import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { getBookingFlowDataBySlug } from "@/lib/actions";

export default async function BookSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  let data = null;
  let dbError = false;
  try {
    data = await getBookingFlowDataBySlug(slug);
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="p-8 text-center text-white/60">
        <p>{t("error")}</p>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <BookingFlow
      host={data.host}
      durations={data.durations}
      locations={data.locations}
      intakeQuestions={data.intakeQuestions}
    />
  );
}
