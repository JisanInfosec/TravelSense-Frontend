"use client";

import { useState } from "react";
import useSWR from "swr";
import { Heart, HeartOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { FavoriteItem } from "@/lib/types";
import { DestinationCard, DestinationCardSkeleton } from "@/components/destinations/destination-card";
import { PageTitle } from "@/components/dashboard/side-nav";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "@/lib/i18n";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { data, error, mutate } = useSWR<FavoriteItem[]>("/me/favorites");
  const toast = useToast();
  const [removing, setRemoving] = useState<string | null>(null);

  const remove = async (id: string, name: string) => {
    setRemoving(id);
    try {
      await api(`/me/favorites/${id}`, { method: "DELETE" });
      await mutate((items) => items?.filter((f) => f.destination.id !== id), { revalidate: false });
      toast(t("dashboard.removedFavourite", { name }));
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t("dashboard.couldNotRemove"), "error");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <>
      <PageTitle title={t("dashboard.favoritePlaces")} description={t("dashboard.favoritesDesc")} />
      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !data ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <DestinationCardSkeleton key={i} />)}</div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t("dashboard.noFavourites")}
          description={t("dashboard.noFavouritesDesc")}
          action={<LinkButton href="/destinations">{t("home.exploreDestinations")}</LinkButton>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.map(({ destination: d }) => (
            <div key={d.id} className="relative">
              <DestinationCard d={d} />
              <button
                onClick={() => remove(d.id, d.name)}
                disabled={removing === d.id}
                className="absolute right-3 top-12 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-danger shadow-sm backdrop-blur transition hover:bg-danger-soft disabled:opacity-60"
                aria-label={`${t("dashboard.remove")} ${d.name} ${t("dashboard.fromFavourites")}`}
              >
                <HeartOff className="size-3.5" /> {t("dashboard.remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
