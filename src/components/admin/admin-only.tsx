"use client";

import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { useTranslation } from "@/lib/i18n";

/** Hides administrator-only pages from moderators. The API enforces the same rule. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (user?.role !== "ADMIN") {
    return (
      <EmptyState
        icon={Lock}
        title={t("admin.adminOnly")}
        description={t("admin.moderatorLimits")}
        action={<LinkButton href="/admin/reviews">{t("admin.goToReviewModeration")}</LinkButton>}
      />
    );
  }
  return <>{children}</>;
}
