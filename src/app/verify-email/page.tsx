import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { Spinner } from "@/components/ui/states";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Check your email" subtitle="Enter the six-digit code we sent to finish creating your account.">
      <Suspense fallback={<Spinner />}><VerifyEmailForm /></Suspense>
    </AuthShell>
  );
}
