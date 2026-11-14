"use client";

import { Compass } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container-page flex flex-1 items-center justify-center py-24">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-leaf text-brand">
          <Compass className="size-8" />
        </div>
        <p className="mt-6 font-display text-6xl font-semibold text-brand">{t("notFound.notFound")}</p>
        <h1 className="mt-2 text-2xl font-semibold">{t("notFound.title")}</h1>
        <p className="mt-2 text-muted">{t("notFound.desc")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/">{t("notFound.backHome")}</LinkButton>
          <LinkButton href="/destinations" variant="secondary">{t("notFound.exploreDestinations")}</LinkButton>
        </div>
      </div>
    </div>
  );
}
