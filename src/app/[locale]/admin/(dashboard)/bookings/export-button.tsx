"use client";

import { exportBookingsCsv } from "@/lib/actions";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ExportButton() {
  const t = useTranslations("admin");

  const handleExport = async () => {
    const csv = await exportBookingsCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    a.click();
  };

  return (
    <Button variant="secondary" onClick={handleExport}>
      {t("exportCsv")}
    </Button>
  );
}
