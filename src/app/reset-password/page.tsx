import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Spinner } from "@/components/ui/states";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="Use a strong password you haven’t used for this account before.">
      <Suspense fallback={<Spinner />}><ResetPasswordForm /></Suspense>
    </AuthShell>
  );
}
