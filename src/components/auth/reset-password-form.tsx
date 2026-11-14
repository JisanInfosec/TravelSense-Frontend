"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiError, api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/form";
import { PasswordChecklist, PASSWORD_RULES } from "./register-form";
import { PasswordInput } from "./password-input";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(token.length === 64 ? null : t("resetPassword.invalidLink"));
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!PASSWORD_RULES.every((rule) => rule.test(password))) nextErrors.password = t("resetPassword.passwordReq");
    if (confirm !== password) nextErrors.confirm = t("resetPassword.matchReq");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || token.length !== 64) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await api("/auth/reset-password", { method: "POST", body: { token, password } });
      router.replace("/login?reset=1");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("resetPassword.failed"));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={formError} />
      {token.length !== 64 && <p className="text-sm"><Link href="/forgot-password" className="font-semibold text-brand hover:underline">{t("resetPassword.requestNew")}</Link></p>}
      <Field label={t("resetPassword.newPassword")} htmlFor="password" error={errors.password}>
        <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={!!errors.password} disabled={token.length !== 64} />
        <PasswordChecklist password={password} />
      </Field>
      <Field label={t("resetPassword.confirmPassword")} htmlFor="confirm" error={errors.confirm}>
        <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} aria-invalid={!!errors.confirm} disabled={token.length !== 64} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={token.length !== 64}>{t("resetPassword.reset")}</Button>
    </form>
  );
}
