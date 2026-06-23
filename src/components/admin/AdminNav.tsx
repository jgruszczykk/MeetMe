"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { adminLogout } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "dashboard" },
  { href: "/admin/bookings", label: "bookings" },
  { href: "/admin/clients", label: "clients" },
  { href: "/admin/calendar", label: "calendar" },
  { href: "/admin/availability/rules", label: "rules" },
  { href: "/admin/settings/general", label: "settings" },
];

export function AdminNav() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 border-r border-white/10 p-4 md:w-56">
      <p className="mb-4 text-lg font-bold text-white">MeetMe</p>
      {links.map((link) => {
        const href = `/${locale}${link.href}`;
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-violet-600/30 text-white" : "text-white/60 hover:text-white",
            )}
          >
            {t(link.label as "dashboard")}
          </Link>
        );
      })}
      <form action={adminLogout} className="mt-auto pt-4">
        <Button type="submit" variant="ghost" className="w-full justify-start">
          {t("logout")}
        </Button>
      </form>
    </nav>
  );
}
