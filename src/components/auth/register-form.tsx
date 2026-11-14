"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn, homeFor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/form";
import { PasswordInput } from "./password-input";
import { safeNext } from "./login-form";
import { useTranslation } from "@/lib/i18n";

export const PASSWORD_RULES = [
  { labelKey: "register.rules.len8", test: (p: string) => p.length >= 8 && p.length <= 72 },
  { labelKey: "register.rules.letter", test: (p: string) => /[A-Za-z]/.test(p) },
  { labelKey: "register.rules.number", test: (p: string) => /\d/.test(p) },
];

export function PasswordChecklist({ password }: { password: string }) {
  const { t } = useTranslation();
  return (
    <ul className="mt-2 grid gap-1 text-[13px] sm:grid-cols-3">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(password);
        return (
          <li key={r.labelKey} className={cn("flex items-center gap-1.5", ok ? "text-brand" : "text-muted")}>
            {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />} {t(r.labelKey)}
          </li>
        );
      })}
    </ul>
  );
}

export function RegisterForm() {
  const { t } = useTranslation();
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !submitting) router.replace(homeFor(user.role));
  }, [loading, user, submitting, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (form.name.trim().length < 2) errs.name = t("register.nameReq");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = t("register.emailReq");
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) errs.password = t("register.passwordReq");
    if (form.confirm !== form.password) errs.confirm = t("register.matchReq");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await register(form.name.trim(), form.email.trim(), form.password);
      const params = new URLSearchParams({ email: result.email });
      if (next) params.set("next", next);
      router.push(`/verify-email?${params.toString()}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setErrors({ email: err.message });
      else setFormError(err instanceof ApiError ? err.message : t("register.registerFailed"));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field label={t("register.fullName")} htmlFor="name" error={errors.name}>
        <Input id="name" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} placeholder={t("register.namePlaceholder")} />
      </Field>
      <Field label={t("register.emailAddress")} htmlFor="email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} placeholder={t("register.emailPlaceholder")} />
      </Field>
      <Field label={t("register.password")} htmlFor="password" error={errors.password}>
        <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={set("password")} aria-invalid={!!errors.password} />
        <PasswordChecklist password={form.password} />
      </Field>
      <Field label={t("register.confirmPassword")} htmlFor="confirm" error={errors.confirm}>
        <PasswordInput id="confirm" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} aria-invalid={!!errors.confirm} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        {t("register.createAccount")}
      </Button>
      <p className="text-center text-sm text-muted">
        {t("register.alreadyAccount")}{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-brand hover:underline">
          {t("register.logIn")}
        </Link>
      </p>
    </form>
  );
}
