"use client";

import { BarChart3, LayoutDashboard, MapPinned, MessageSquareText, UserRound, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { RequireRole } from "@/components/auth/require-role";
import { SideNav } from "@/components/dashboard/side-nav";
import { Avatar } from "@/components/layout/navbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["ADMIN", "MODERATOR"]}>
      <Inner>{children}</Inner>
    </RequireRole>
  );
}

function Inner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const adminNav = [
    { href: "/admin", label: t("admin.overview"), icon: LayoutDashboard, exact: true },
    { href: "/admin/destinations", label: t("admin.destinations"), icon: MapPinned },
    { href: "/admin/reviews", label: t("admin.reviews"), icon: MessageSquareText },
    { href: "/admin/users", label: t("admin.users"), icon: Users },
    { href: "/admin/reports", label: t("admin.reports"), icon: BarChart3 },
    { href: "/admin/profile", label: t("admin.myProfile"), icon: UserRound },
  ];
  const moderatorNav = [
    { href: "/admin", label: t("admin.overview"), icon: LayoutDashboard, exact: true },
    { href: "/admin/reviews", label: t("admin.reviews"), icon: MessageSquareText },
    { href: "/admin/profile", label: t("admin.myProfile"), icon: UserRound },
  ];
  const roleKey = user?.role === "ADMIN" ? "administrator" : user?.role === "MODERATOR" ? "moderator" : "tourist";
  return (
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 hidden rounded-2xl bg-brand-dark p-4 text-white lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">{t("admin.staffConsole")}</p>
          <div className="mt-3 flex items-center gap-3">
            {user && <Avatar name={user.name} url={user.avatarUrl} />}
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.name}</p>
              <p className="text-xs text-white/70">{user && t(`common.${roleKey}`)}</p>
            </div>
          </div>
        </div>
        <SideNav items={user?.role === "ADMIN" ? adminNav : moderatorNav} />
      </aside>
      <div className="min-w-0 animate-fade-up">{children}</div>
    </div>
  );
}
