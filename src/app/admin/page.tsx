"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, CircleCheck, Clock3, Heart, MapPinned, MessageSquareText, Users, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { ModerationReview, Paginated, Reports } from "@/lib/types";
import { PageTitle } from "@/components/dashboard/side-nav";
import { StatTile } from "@/components/admin/stat-tile";
import { ModerationCard } from "@/components/admin/moderation-list";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useTranslation } from "@/lib/i18n";

export default function AdminOverview() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: reports, error } = useSWR<Reports>(isAdmin ? "/admin/reports" : null);
  const { data: summary } = useSWR<Record<"PENDING" | "APPROVED" | "REJECTED", number>>("/moderation/reviews/summary");
  const { data: pending, mutate } = useSWR<Paginated<ModerationReview>>("/moderation/reviews?status=PENDING&limit=3");

  return (
    <div className="space-y-8">
      <PageTitle
        title={isAdmin ? t("admin.adminOverview") : t("admin.moderationOverview")}
        description={isAdmin ? t("admin.snapshot") : t("admin.waiting")}
        action={isAdmin ? <LinkButton href="/admin/destinations/new">{t("admin.addDestinationBtn")}</LinkButton> : undefined}
      />

      {error && <ErrorState message={error.message} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <StatTile label={t("admin.totalUsers")} value={reports?.totals.users} icon={Users} hint={reports ? t("admin.last30Days", { n: reports.totals.newUsersLast30Days }) : undefined} />
            <StatTile label={t("admin.destinations")} value={reports?.totals.destinations} icon={MapPinned} />
            <StatTile label={t("admin.pending")} value={reports?.totals.pendingReviews} icon={Clock3} tone="warn" />
            <StatTile label={t("dashboard.savedPlaces")} value={reports ? reports.totals.favorites + reports.totals.wishlist : undefined} icon={Heart} hint={t("dashboard.savedPlacesHint")} />
          </>
        ) : (
          <>
            <StatTile label={t("dashboard.pending")} value={summary?.PENDING} icon={Clock3} tone="warn" />
            <StatTile label={t("dashboard.approved")} value={summary?.APPROVED} icon={CircleCheck} />
            <StatTile label={t("dashboard.rejected")} value={summary?.REJECTED} icon={XCircle} tone="danger" />
            <StatTile label={t("admin.totalReviews")} value={summary ? summary.PENDING + summary.APPROVED + summary.REJECTED : undefined} icon={MessageSquareText} tone="neutral" />
          </>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("admin.oldestPending")}</h2>
          <Link href="/admin/reviews" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            {t("admin.openQueue")} <ArrowRight className="size-4" />
          </Link>
        </div>
        {!pending ? (
          <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
        ) : pending.items.length === 0 ? (
          <EmptyState icon={CircleCheck} title={t("admin.caughtUp")} description={t("admin.caughtUpDesc")} />
        ) : (
          <div className="space-y-3">
            {pending.items.map((r) => <ModerationCard key={r.id} r={r} onDone={() => mutate()} t={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}
