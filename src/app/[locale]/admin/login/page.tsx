"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { adminLogin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await adminLogin(password);
    if (result.success) {
      router.push(`/${locale}/admin`);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-xl font-bold text-white">{t("login")}</h1>
        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2"
          />
        </div>
        {error && <p className="text-sm text-red-400">Invalid password</p>}
        <Button type="submit" className="w-full">
          {t("loginButton")}
        </Button>
      </form>
    </div>
  );
}
