"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export function LanguageSelector({ className }: { className?: string }) {
  const { lang, setLang, t } = useTranslation();
  const languageLabel = lang === "en" ? "English" : "বাংলা";

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as "en" | "bn")}>
      <SelectTrigger
        className={cn(
          "h-10 w-[8.5rem] shrink-0 gap-1.5 rounded-full border-line/70 bg-surface/70 px-3 text-sm font-semibold text-ink shadow-none backdrop-blur-sm transition hover:border-brand/40 hover:bg-surface focus:ring-2 focus:ring-brand/15",
          className,
        )}
        aria-label={`${t("nav.language")}: ${languageLabel}`}
      >
        <span className="inline-flex min-w-0 flex-nowrap items-center gap-2 whitespace-nowrap">
          <Languages className="size-4 shrink-0 opacity-80" />
          <span className="truncate">{languageLabel}</span>
        </span>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[8.5rem]">
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="bn">বাংলা</SelectItem>
      </SelectContent>
    </Select>
  );
}
