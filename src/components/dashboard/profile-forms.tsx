"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordChecklist, PASSWORD_RULES } from "@/components/auth/register-form";
import { Avatar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "@/lib/i18n";

const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function ProfileForm() {
  const { user } = useAuth();
  return user ? <ProfileFormInner user={user} key={user.id} /> : null;
}

function ProfileFormInner({ user }: { user: User }) {
  const { t } = useTranslation();
  const { refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    city: user.city ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const photoUploadError = (error: unknown) => {
    if (!(error instanceof ApiError)) return t("profile.couldNotUploadPhoto");
    if (error.status === 0) return t("profile.photoServerUnreachable");
    if (error.status === 401) return t("profile.photoSessionExpired");
    if (error.status === 403) return t("profile.photoPermissionDenied");
    if (error.status === 404 || error.status === 405) return t("profile.photoUploadUnavailable");
    if (error.status === 413) return t("profile.photoTooLarge");
    if (error.status === 503) return t("profile.photoServiceUnavailable");
    return t("profile.couldNotUploadPhotoReason", { reason: error.message });
  };

  const profilePhotoBody = (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return body;
  };

  const uploadProfilePhoto = async (file: File) => {
    // The deployed API already exposes this upload route for administrators.
    if (user.role === "ADMIN") {
      const uploaded = await api<{ url: string }>("/admin/uploads", {
        method: "POST",
        body: profilePhotoBody(file),
      });
      return api<User>("/users/me", {
        method: "PATCH",
        body: { avatarUrl: uploaded.url },
      });
    }

    return api<User>("/users/me/avatar", {
      method: "POST",
      body: profilePhotoBody(file),
    });
  };

  const uploadPhoto = async (file: File) => {
    if (!PROFILE_PHOTO_TYPES.has(file.type)) return setPhotoError(t("profile.photoTypeInvalid"));
    if (file.size > MAX_PROFILE_PHOTO_BYTES) return setPhotoError(t("profile.photoTooLarge"));

    setPhotoError(null);
    setUploadingPhoto(true);
    try {
      const updated = await uploadProfilePhoto(file);
      setForm((current) => ({ ...current, avatarUrl: updated.avatarUrl ?? "" }));
      await refresh();
      toast(t("profile.photoUpdated"));
    } catch (error) {
      setPhotoError(photoUploadError(error));
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = async () => {
    setPhotoError(null);
    setRemovingPhoto(true);
    try {
      const updated = await api<User>("/users/me", { method: "PATCH", body: { avatarUrl: "" } });
      setForm((current) => ({ ...current, avatarUrl: updated.avatarUrl ?? "" }));
      await refresh();
      toast(t("profile.photoRemoved"));
    } catch {
      setPhotoError(t("profile.couldNotRemovePhoto"));
    } finally {
      setRemovingPhoto(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError(t("profile.nameMin2"));
    setError(null);
    setSaving(true);
    try {
      await api("/users/me", { method: "PATCH", body: form });
      await refresh();
      toast(t("profile.profileUpdated"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("profile.couldNotUpdate"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative w-fit shrink-0">
          <Avatar name={form.name || user.name} url={form.avatarUrl.trim() || null} size="xl" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto || removingPhoto}
            className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full border-2 border-surface bg-brand text-white shadow-md transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={form.avatarUrl ? t("profile.changePhoto") : t("profile.uploadPhoto")}
          >
            <Camera className="size-4" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-sans text-lg font-bold">{t("profile.personalDetails")}</h2>
          <p className="text-sm text-muted">{t("profile.nameShown")}</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadPhoto(file);
            }}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={uploadingPhoto}
              disabled={removingPhoto}
              onClick={() => fileRef.current?.click()}
            >
              {!uploadingPhoto && <Camera className="size-4" />}
              {form.avatarUrl ? t("profile.changePhoto") : t("profile.uploadPhoto")}
            </Button>
            {form.avatarUrl && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-danger hover:bg-danger-soft"
                loading={removingPhoto}
                disabled={uploadingPhoto}
                onClick={() => void removePhoto()}
              >
                {!removingPhoto && <Trash2 className="size-4" />}
                {t("profile.removePhoto")}
              </Button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">{t("profile.photoHelp")}</p>
          <FormError message={photoError} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("profile.fullName")} htmlFor="p-name">
          <Input id="p-name" value={form.name} onChange={set("name")} required />
        </Field>
        <Field label={t("profile.emailAddress")} htmlFor="p-email" hint={t("profile.emailHint")}>
          <Input id="p-email" value={user.email} disabled />
        </Field>
        <Field label={t("profile.phone")} htmlFor="p-phone" optional>
          <Input id="p-phone" value={form.phone} onChange={set("phone")} placeholder={t("profile.phonePlaceholder")} inputMode="tel" />
        </Field>
        <Field label={t("profile.city")} htmlFor="p-city" optional>
          <Input id="p-city" value={form.city} onChange={set("city")} placeholder={t("profile.cityPlaceholder")} />
        </Field>
        <Field label={t("profile.photoUrl")} htmlFor="p-avatar" optional className="sm:col-span-2">
          <Input id="p-avatar" value={form.avatarUrl} onChange={set("avatarUrl")} placeholder={t("profile.photoPlaceholder")} inputMode="url" />
        </Field>
        <Field label={t("profile.aboutYou")} htmlFor="p-bio" optional className="sm:col-span-2" hint={t("profile.bioChars", { len: form.bio.length })}>
          <Textarea id="p-bio" value={form.bio} onChange={set("bio")} maxLength={500} placeholder={t("profile.bioPlaceholder")} />
        </Field>
      </div>
      <div className="mt-5 space-y-4">
        <FormError message={error} />
        <Button type="submit" loading={saving} disabled={uploadingPhoto || removingPhoto}>{t("profile.saveChanges")}</Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword) return setError(t("profile.currentReq"));
    if (!PASSWORD_RULES.every((r) => r.test(form.newPassword))) return setError(t("profile.newPasswordReq"));
    if (form.newPassword !== form.confirm) return setError(t("profile.matchNew"));
    setError(null);
    setSaving(true);
    try {
      await api("/users/me/password", { method: "PATCH", body: { currentPassword: form.currentPassword, newPassword: form.newPassword } });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast(t("profile.passwordChanged"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("profile.couldNotChange"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <h2 className="font-sans text-lg font-bold">{t("profile.changePassword")}</h2>
      <p className="mb-5 text-sm text-muted">{t("profile.passwordStored")}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("profile.currentPassword")} htmlFor="pw-current" className="sm:col-span-2">
          <PasswordInput id="pw-current" autoComplete="current-password" value={form.currentPassword} onChange={set("currentPassword")} />
        </Field>
        <Field label={t("profile.newPassword")} htmlFor="pw-new">
          <PasswordInput id="pw-new" autoComplete="new-password" value={form.newPassword} onChange={set("newPassword")} />
        </Field>
        <Field label={t("profile.confirmNewPassword")} htmlFor="pw-confirm">
          <PasswordInput id="pw-confirm" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} />
        </Field>
      </div>
      <PasswordChecklist password={form.newPassword} />
      <div className="mt-5 space-y-4">
        <FormError message={error} />
        <Button type="submit" variant="secondary" loading={saving}>{t("profile.updatePassword")}</Button>
      </div>
    </form>
  );
}
