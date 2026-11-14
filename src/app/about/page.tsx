"use client";

import { BadgeCheck, Compass, HeartHandshake, MapPinned, MessageSquareText, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

const IMG = "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Paharpur_Buddhist_Bihar.jpg/1280px-Paharpur_Buddhist_Bihar.jpg";

export default function AboutPage() {
  const { t } = useTranslation();
  const features = [
    { icon: Compass, title: t("about.discover"), text: t("about.discoverText") },
    { icon: MapPinned, title: t("about.navigate"), text: t("about.navigateText") },
    { icon: ShieldCheck, title: t("about.staySafe"), text: t("about.staySafeText") },
    { icon: MessageSquareText, title: t("about.trustedReviews"), text: t("about.trustedReviewsText") },
    { icon: HeartHandshake, title: t("about.planTrips"), text: t("about.planTripsText") },
    { icon: BadgeCheck, title: t("about.transparentData"), text: t("about.transparentDataText") },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-dark text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-30" />
        <div className="container-page py-20 sm:py-28">
          <p className="eyebrow text-leaf">{t("about.aboutTravelSense")}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">{t("about.aboutTitle")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{t("about.aboutDesc")}</p>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-leaf text-brand">
                <f.icon className="size-6" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">{t("about.aboutInformation")}</h2>
            <p className="mt-4 leading-relaxed text-muted">{t("about.aboutInfoDesc")}</p>
            <p className="mt-4 leading-relaxed text-muted">{t("about.photos")} {t("about.phones")}</p>
          </div>
          <div className="rounded-2xl bg-leaf p-6 sm:p-8">
            <h3 className="font-sans text-lg font-bold text-brand-dark">{t("about.contact")}</h3>
            <p className="mt-2 text-sm text-brand-dark/80">{t("about.contactDesc")}</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div><dt className="font-semibold text-brand-dark">{t("about.email")}</dt><dd className="text-brand-dark/70">{t("about.emailPlaceholder")}</dd></div>
              <div><dt className="font-semibold text-brand-dark">{t("about.phone")}</dt><dd className="text-brand-dark/70">{t("about.phonePlaceholder")}</dd></div>
              <div><dt className="font-semibold text-brand-dark">{t("about.socialMedia")}</dt><dd className="text-brand-dark/70">{t("about.socialPlaceholder")}</dd></div>
            </dl>
            <LinkButton href="/destinations" className="mt-6">{t("about.startExploring")}</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
