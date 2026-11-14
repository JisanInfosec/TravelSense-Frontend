"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { homeFor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { safeNext } from "./login-form";

export function VerifyEmailForm() {
  const { t } = useTranslation();
  const { verifyEmail, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!loading && user && !submitting) router.replace(homeFor(user.role));
  }, [loading, user, submitting, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t("verifyEmail.emailReq"));
    if (!/^\d{6}$/.test(otp)) return setError(t("verifyEmail.otpReq"));
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const verifiedUser = await verifyEmail(email.trim(), otp);
      router.replace(next ?? homeFor(verifiedUser.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("verifyEmail.verifyFailed"));
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t("verifyEmail.emailReq"));
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const result = await api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: { email: email.trim() },
      });
      setNotice(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("verifyEmail.resendFailed"));
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={error} />
      {notice && <div role="status" className="rounded-xl border border-brand/20 bg-leaf-soft px-4 py-3 text-sm text-brand-dark">{notice}</div>}
      <Field label={t("verifyEmail.emailAddress")} htmlFor="email">
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("verifyEmail.emailPlaceholder")} />
      </Field>
      <Field label={t("verifyEmail.code")} htmlFor="otp" hint={t("verifyEmail.codeHint")}>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className="text-center text-xl font-semibold tracking-[0.45em]"
          placeholder="000000"
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>{t("verifyEmail.verify")}</Button>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" onClick={resend} disabled={resending} className="font-semibold text-brand hover:underline disabled:opacity-50">
          {resending ? t("verifyEmail.sending") : t("verifyEmail.resend")}
        </button>
        <Link href="/login" className="font-semibold text-brand hover:underline">{t("verifyEmail.backToLogin")}</Link>
      </div>
    </form>
  );
}
