"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

export function SearchForm({
  defaultStatus,
  defaultSearch,
}: {
  defaultStatus: string;
  defaultSearch: string;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams();
    params.set("status", key === "status" ? value : defaultStatus);
    if (key === "search" ? value : defaultSearch) {
      params.set("search", key === "search" ? value : defaultSearch);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <select
        value={defaultStatus}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
      >
        <option value="pending">{t("filterPending")}</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
        <option value="all">{t("filterAll")}</option>
      </select>
      <Input
        placeholder={t("search")}
        defaultValue={defaultSearch}
        onBlur={(e) => update("search", e.target.value)}
        className="max-w-xs"
      />
    </div>
  );
}
