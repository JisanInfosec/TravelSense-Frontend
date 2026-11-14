"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t("forgotPassword.emailReq"));
    setError(null);
    setSubmitting(true);
    try {
      const result = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("forgotPassword.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (message) {
    return (
      <div className="space-y-5">
        <div role="status" className="rounded-xl border border-brand/20 bg-leaf-soft px-4 py-4 text-sm text-brand-dark">{message}</div>
        <p className="text-sm text-muted">{t("forgotPassword.checkSpam")}</p>
        <LinkButton href="/login" size="lg" className="w-full">{t("forgotPassword.backToLogin")}</LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={error} />
      <Field label={t("forgotPassword.emailAddress")} htmlFor="email" hint={t("forgotPassword.emailHint")}>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("forgotPassword.emailPlaceholder")} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>{t("forgotPassword.sendLink")}</Button>
      <p className="text-center text-sm text-muted"><Link href="/login" className="font-semibold text-brand hover:underline">{t("forgotPassword.backToLogin")}</Link></p>
    </form>
  );
}
