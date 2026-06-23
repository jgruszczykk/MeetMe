"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { adminLogout } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "dashboard", exact: true },
  { href: "/admin/bookings", label: "bookings" },
  { href: "/admin/clients", label: "clients" },
  { href: "/admin/calendar", label: "calendar" },
  { href: "/admin/availability/rules", label: "rules" },
  { href: "/admin/settings/general", label: "settings" },
  { href: "/admin/settings/durations", label: "durations" },
  { href: "/admin/settings/intake", label: "intakeNav" },
] as const;

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 border-r border-white/10 p-4 md:w-56">
      <p className="mb-4 text-lg font-bold text-white">MeetMe</p>
      {links.map((link) => {
        const href = `/${locale}${link.href}`;
        const active = isNavActive(pathname, href, "exact" in link ? link.exact : false);
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
