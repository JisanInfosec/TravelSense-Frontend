"use client";

import Link from "next/link";
import useSWR from "swr";
import { CircleCheck, Clock3, MapPinned, MessageSquareText, Printer, Users, XCircle } from "lucide-react";
import type { Reports, ReportRow } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/side-nav";
import { AdminOnly } from "@/components/admin/admin-only";
import { StatTile } from "@/components/admin/stat-tile";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { useTranslation } from "@/lib/i18n";

export default function ReportsPage() {
  const { t } = useTranslation();
  return (
    <AdminOnly>
      <ReportsView t={t} />
    </AdminOnly>
  );
}

function ReportsView({ t }: { t: any }) {
  const { data, error, mutate } = useSWR<Reports>("/admin/reports");
  if (error) return <ErrorState message={error.message} onRetry={() => mutate()} />;
  const tData = data?.totals;

  return (
    <div className="space-y-8">
      <PageTitle
        title={t("reports.systemReports")}
        description={data ? t("reports.generated", { date: formatDate(data.generatedAt, { dateStyle: "medium", timeStyle: "short" }) }) : t("common.loading")}
        action={<Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" /> {t("reports.print")}</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile label={t("reports.totalUsers")} value={tData?.users} icon={Users} hint={data ? Object.entries(data.usersByRole).map(([r, n]) => `${n} ${t(`common.${r.toLowerCase()}`)}`).join(" · ") : undefined} />
        <StatTile label={t("reports.totalDestinations")} value={tData?.destinations} icon={MapPinned} />
        <StatTile label={t("reports.allReviews")} value={tData?.reviews} icon={MessageSquareText} tone="neutral" />
        <StatTile label={t("reports.approvedReviews")} value={tData?.approvedReviews} icon={CircleCheck} />
        <StatTile label={t("reports.pendingReviews")} value={tData?.pendingReviews} icon={Clock3} tone="warn" />
        <StatTile label={t("reports.rejectedReviews")} value={tData?.rejectedReviews} icon={XCircle} tone="danger" />
      </div>

      {tData && tData.reviews > 0 && (
        <section className="card p-5 sm:p-6">
          <h2 className="font-sans text-base font-bold">{t("reports.moderationStatus")}</h2>
          <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${tData.approvedReviews} approved, ${tData.pendingReviews} pending, ${tData.rejectedReviews} rejected`}>
            <div className="bg-brand" style={{ width: `${(tData.approvedReviews / tData.reviews) * 100}%` }} title={`Approved: ${tData.approvedReviews}`} />
            <div className="bg-gold" style={{ width: `${(tData.pendingReviews / tData.reviews) * 100}%` }} title={`Pending: ${tData.pendingReviews}`} />
            <div className="bg-danger" style={{ width: `${(tData.rejectedReviews / tData.reviews) * 100}%` }} title={`Rejected: ${tData.rejectedReviews}`} />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-brand" /> {t("reviewStatus.APPROVED")} {tData.approvedReviews}</li>
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-gold" /> {t("reviewStatus.PENDING")} {tData.pendingReviews}</li>
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-danger" /> {t("reviewStatus.REJECTED")} {tData.rejectedReviews}</li>
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <RankedBars
          title={t("reports.mostSaved")}
          subtitle={t("reports.mostSavedSub")}
          rows={data?.mostSaved}
          value={(r) => r.saves}
          detail={(r) => `${r.favorites} favourites · ${r.wishlist} wishlist`}
          t={t}
        />
        <RankedBars
          title={t("reports.mostReviewed")}
          subtitle={t("reports.mostReviewedSub")}
          rows={data?.mostReviewed}
          value={(r) => r.totalReviews}
          detail={(r) => `${r.approvedReviews} approved${r.averageRating !== null ? ` · ★ ${r.averageRating}` : ""}`}
          t={t}
        />
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="font-sans text-base font-bold">{t("reports.byCategory")}</h2>
        {!data ? (
          <Skeleton className="mt-4 h-40" />
        ) : (
          <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {data.destinationsByCategory.map((c) => (
              <li key={c.category} className="grid grid-cols-[10rem_1fr_2rem] items-center gap-3 text-sm" title={`${c.label}: ${c.count}`}>
                <span className="truncate text-ink">{c.label}</span>
                <span className="h-2 rounded-full bg-canvas">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(c.count / Math.max(...data.destinationsByCategory.map((x) => x.count))) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums text-muted">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RankedBars({
  title,
  subtitle,
  rows,
  value,
  detail,
  t,
}: {
  title: string;
  subtitle: string;
  rows: ReportRow[] | undefined;
  value: (r: ReportRow) => number;
  detail: (r: ReportRow) => string;
  t: any;
}) {
  const max = rows?.length ? Math.max(...rows.map(value)) : 1;
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-sans text-base font-bold">{title}</h2>
      <p className="text-sm text-muted">{subtitle}</p>
      {!rows ? (
        <Skeleton className="mt-4 h-48" />
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-canvas p-4 text-sm text-muted">{t("reports.noData")}</p>
      ) : (
        <ol className="mt-4 space-y-3.5">
          {rows.map((r, i) => (
            <li key={r.id} title={`${r.name}: ${value(r)}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <Link href={`/destinations/${r.slug}`} className="min-w-0 truncate font-semibold hover:text-brand">
                  <span className="mr-2 text-muted tabular-nums">{i + 1}.</span>
                  {r.name}
                </Link>
                <span className="shrink-0 font-semibold tabular-nums">{value(r)}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-canvas">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(value(r) / max) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted">{detail(r)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
