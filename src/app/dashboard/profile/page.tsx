"use client";

import { PageTitle } from "@/components/dashboard/side-nav";
import { PasswordForm, ProfileForm } from "@/components/dashboard/profile-forms";
import { useTranslation } from "@/lib/i18n";

export default function ProfilePage() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t("dashboard.editProfile")} description={t("profile.personalDetails")} />
      <div className="space-y-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}
