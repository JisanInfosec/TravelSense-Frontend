"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { homeFor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { PasswordInput } from "./password-input";
import { useTranslation } from "@/lib/i18n";

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function LoginForm() {
  const { t } = useTranslation();
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const passwordWasReset = searchParams.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next ?? homeFor(user.role));
  }, [loading, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = t("login.emailReq");
    if (!password) errs.password = t("login.passwordReq");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setFormError(null);
    setNeedsVerification(false);
    setSubmitting(true);
    try {
      const u = await login(email.trim(), password);
      router.replace(next ?? homeFor(u.role));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setNeedsVerification(true);
      setFormError(err instanceof ApiError ? err.message : t("login.loginFailed"));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {passwordWasReset && (
        <div role="status" className="rounded-xl border border-brand/20 bg-leaf-soft px-4 py-3 text-sm text-brand-dark">
          {t("login.passwordResetSuccess")}
        </div>
      )}
      <FormError message={formError} />
      {needsVerification && (
        <p className="text-sm text-muted">
          <Link href={`/verify-email?email=${encodeURIComponent(email.trim())}`} className="font-semibold text-brand hover:underline">
            {t("login.verifyOrResend")}
          </Link>
        </p>
      )}
      <Field label={t("login.emailAddress")} htmlFor="email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} placeholder={t("login.emailPlaceholder")} />
      </Field>
      <Field label={t("login.password")} htmlFor="password" error={errors.password}>
        <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">
            {t("login.forgotPassword")}
          </Link>
        </div>
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        {t("login.logIn")}
      </Button>
      <p className="text-center text-sm text-muted">
        {t("login.newHere")}{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-brand hover:underline">
          {t("login.createAccount")}
        </Link>
      </p>
    </form>
  );
}
