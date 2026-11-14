"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Map, Menu, ShieldCheck, User, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn, homeFor, initials } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "./logo";
import { LanguageSelector } from "./language-selector";
import { useTranslation } from "@/lib/i18n";

const NAV = [
  { href: "/", labelKey: "nav.home" },
  { href: "/destinations", labelKey: "nav.exploreDestinations" },
  { href: "/about", labelKey: "nav.about" },
];

/** Static shell shown while the interactive navbar loads. */
export function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-line bg-surface/90 backdrop-blur-md md:h-[72px]">
      <div className="container-page flex h-full items-center">
        <Logo />
      </div>
    </header>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const dashboard = homeFor(user?.role);
  const onLogout = () => {
    logout();
    router.push("/");
  };

  const navLabel = (key: string) => t(key);

  return (
    <header
      className={cn(
        "z-50 transition-colors duration-300",
        pathname === "/" ? "fixed inset-x-0 top-0" : "sticky top-0",
        overHero ? "bg-transparent" : "border-b border-line bg-surface/90 backdrop-blur-md",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[72px] xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
        <Logo
          light={overHero}
          className="shrink-0 [&>svg]:size-7 [&>span]:hidden min-[400px]:[&>span]:inline min-[400px]:[&>span]:text-lg sm:[&>svg]:size-8 sm:[&>span]:text-[1.35rem]"
        />

        <nav className="hidden shrink-0 items-center gap-1 xl:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                overHero
                  ? isActive(n.href) ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                  : isActive(n.href) ? "bg-leaf text-brand-dark" : "text-muted hover:bg-leaf-soft hover:text-ink",
              )}
            >
              {navLabel(n.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center justify-self-end gap-2.5 xl:flex">
          <LanguageSelector
            className={cn(
              overHero && "border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 [&_svg]:opacity-90",
            )}
          />
          {loading ? (
            <div className="h-10 w-28" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full border pl-1.5 pr-3 text-sm font-semibold transition",
                  overHero ? "border-white/25 bg-white/10 text-white hover:bg-white/15" : "border-line/70 bg-surface/70 text-ink hover:border-brand/40 hover:bg-surface",
                )}
              >
                <Avatar name={user.name} url={user.avatarUrl} />
                <span className="max-w-28 truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown className="size-4 opacity-70" />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div role="menu" className="animate-fade-up absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate font-semibold text-ink">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <p className="mt-1 text-xs font-semibold text-brand">{t(`common.${user.role.toLowerCase()}`)}</p>
                    </div>
                    <div className="p-1.5 text-sm">
                      {user.role === "TOURIST" ? (
                        <>
                          <MenuLink href="/dashboard" icon={LayoutDashboard}>{t("dashboard.overview")}</MenuLink>
                          <MenuLink href="/dashboard/favorites" icon={Heart}>{t("dashboard.favoritePlaces")}</MenuLink>
                          <MenuLink href="/dashboard/wishlist" icon={Map}>{t("dashboard.travelWishlist")}</MenuLink>
                          <MenuLink href="/dashboard/profile" icon={User}>{t("dashboard.editProfile")}</MenuLink>
                        </>
                      ) : (
                        <MenuLink href="/admin" icon={ShieldCheck}>
                          {user.role === "ADMIN" ? t("nav.adminDashboard") : t("nav.moderation")}
                        </MenuLink>
                      )}
                      <button
                        role="menuitem"
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-danger hover:bg-danger-soft"
                      >
                        <LogOut className="size-4" /> {t("common.logOut")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition",
                  overHero ? "text-white hover:bg-white/10" : "text-ink hover:bg-leaf-soft",
                )}
              >
                {t("common.logIn")}
              </Link>
              <Link href="/register" className={buttonClass(overHero ? "light" : "primary", "sm", "h-10 shrink-0 whitespace-nowrap rounded-full px-5")}>
                {t("common.register")}
              </Link>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <LanguageSelector
            className={cn(
              "h-9 w-[7.25rem] gap-1.5 px-2.5 text-[13px]",
              overHero && "border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 [&_svg]:opacity-90",
            )}
          />
          <button
            className={cn("grid size-10 place-items-center rounded-full transition", overHero ? "text-white hover:bg-white/10" : "text-ink hover:bg-leaf-soft")}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-up border-t border-line bg-surface xl:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-xl px-4 py-3 font-semibold",
                  isActive(n.href) ? "bg-leaf text-brand-dark" : "text-ink hover:bg-leaf-soft",
                )}
              >
                {navLabel(n.labelKey)}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar name={user.name} url={user.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="text-xs text-muted">{t(`common.${user.role.toLowerCase()}`)}</p>
                  </div>
                </div>
                <Link href={dashboard} className="rounded-xl px-4 py-3 font-semibold hover:bg-leaf-soft">
                  {user.role === "TOURIST" ? t("dashboard.favoritePlaces") : user.role === "ADMIN" ? t("nav.adminDashboard") : t("nav.moderation")}
                </Link>
                <button onClick={onLogout} className="rounded-xl px-4 py-3 text-left font-semibold text-danger hover:bg-danger-soft">
                  {t("common.logOut")}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link href="/login" className={buttonClass("secondary")}>{t("common.logIn")}</Link>
                <Link href="/register" className={buttonClass("primary")}>{t("common.register")}</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ink hover:bg-leaf-soft">
      <Icon className="size-4 text-muted" /> {children}
    </Link>
  );
}

export function Avatar({ name, url, size = "sm" }: { name: string; url?: string | null; size?: "sm" | "lg" | "xl" }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const cls = size === "xl" ? "size-24 text-2xl" : size === "lg" ? "size-16 text-xl" : "size-8 text-xs";
  if (url && failedUrl !== url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" onError={() => setFailedUrl(url)} className={cn("shrink-0 rounded-full object-cover", cls)} />;
  }
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-brand font-bold text-white", cls)}>
      {initials(name)}
    </span>
  );
}
