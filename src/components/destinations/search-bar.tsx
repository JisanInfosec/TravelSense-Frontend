"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Hero search: keyword + optional category, submits to the Explore page. */
export function HeroSearch({ className }: { className?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category && category !== "all") params.set("category", category);
    router.push(`/destinations${params.size ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "flex w-full flex-col gap-2 rounded-3xl bg-white p-2 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:rounded-full",
        className,
      )}
    >
      <label className="flex flex-1 items-center gap-3 px-4 py-2 sm:py-0">
        <Search className="size-5 shrink-0 text-brand" />
        <span className="sr-only">{t("common.searchDestinations")}</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("home.searchPlaceholder")}
          className="h-10 w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
        />
      </label>
      <div className="hidden h-8 w-px bg-line sm:block" />
      <div className="px-4 sm:px-2 sm:w-52">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 w-full border-0 bg-transparent px-2 text-sm font-medium shadow-none focus:ring-0" aria-label={t("common.category")}>
            <SelectValue placeholder={t("common.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allCategories")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{t(`categoryLabels.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        type="submit"
        className="h-12 rounded-full bg-brand px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        {t("common.search")}
      </button>
    </form>
  );
}
