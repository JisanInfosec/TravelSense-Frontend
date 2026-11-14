"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Search, Trash2, UserPlus, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AdminUser, Paginated, Role } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/side-nav";
import { AdminOnly } from "@/components/admin/admin-only";
import { PasswordChecklist, PASSWORD_RULES } from "@/components/auth/register-form";
import { PasswordInput } from "@/components/auth/password-input";
import { Avatar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Field, FormError, Input, Select } from "@/components/ui/form";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useTranslation } from "@/lib/i18n";

const ROLE_TONE: Record<Role, "green" | "info" | "neutral"> = { ADMIN: "green", MODERATOR: "info", TOURIST: "neutral" };

export default function UsersPage() {
  const { t } = useTranslation();
  return (
    <AdminOnly>
      <UsersManager t={t} />
    </AdminOnly>
  );
}

function UsersManager({ t }: { t: any }) {
  const { user: me } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const tId = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(tId);
  }, [q]);

  const params = new URLSearchParams({ page: String(page), limit: "15" });
  if (debounced) params.set("q", debounced);
  if (role) params.set("role", role);
  const { data, error, mutate } = useSWR<Paginated<AdminUser>>(`/admin/users?${params}`, { keepPreviousData: true });

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/admin/users/${toDelete.id}`, { method: "DELETE" });
      toast(t("users.accountRemoved", { name: toDelete.name }));
      setToDelete(null);
      void mutate();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t("users.couldNotDelete"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageTitle
        title={t("users.userManagement")}
        description={t("users.userManagementDesc")}
        action={<Button onClick={() => setCreating(true)}><UserPlus className="size-4" /> {t("users.createStaff")}</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">{t("users.searchUsers")}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("users.searchUsersPlaceholder")}
            className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </label>
        <Select value={role} onChange={(e) => {
            setRole(e.target.value as Role | "");
            setPage(1);
          }} className="h-11 rounded-full" wrapperClassName="sm:w-48" aria-label={t("users.filterRole")}>
          <option value="">{t("users.allRoles")}</option>
          <option value="TOURIST">{t("users.tourists")}</option>
          <option value="MODERATOR">{t("users.moderators")}</option>
          <option value="ADMIN">{t("users.administrators")}</option>
        </Select>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => mutate()} />
      ) : !data ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : data.items.length === 0 ? (
        <EmptyState icon={Users} title={t("users.noUsersFound")} description={t("users.noUsersFoundDesc")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,2fr)_8rem_8rem_7rem_3rem] gap-4 border-b border-line bg-canvas/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted md:grid">
            <span>{t("users.user")}</span><span>{t("users.role")}</span><span>{t("users.activity")}</span><span>{t("users.joined")}</span><span />
          </div>
          <ul className="divide-y divide-line">
            {data.items.map((u) => (
              <li key={u.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 md:grid-cols-[minmax(0,2fr)_8rem_8rem_7rem_3rem] md:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={u.name} url={u.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {u.name} {u.id === me?.id && <span className="text-xs font-normal text-muted">{t("users.you")}</span>}
                    </p>
                    <p className="truncate text-sm text-muted">{u.email}</p>
                  </div>
                </div>
                <div className="order-last col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-11 text-xs text-muted md:order-none md:contents md:pl-0">
                  <span><Badge tone={ROLE_TONE[u.role]}>{t(`common.${u.role.toLowerCase()}`)}</Badge></span>
                  <span className="md:text-sm">{t("users.reviewsSaved", { reviews: u._count.reviews, saved: u._count.favorites + u._count.wishlist })}</span>
                  <span className="md:text-sm">{formatDate(u.createdAt)}</span>
                </div>
                <button
                  onClick={() => setToDelete(u)}
                  disabled={u.id === me?.id}
                  className={cn("grid size-9 place-items-center justify-self-end rounded-full text-muted transition hover:bg-danger-soft hover:text-danger disabled:invisible")}
                  aria-label={`Delete ${u.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t("explore.previous")}</Button>
              <span className="text-sm text-muted">{t("explore.pageXofY", { page, totalPages: data.totalPages })}</span>
              <Button size="sm" variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>{t("explore.next")}</Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t("users.deleteAccountTitle")}
        message={
          <>
            <strong className="text-ink">{toDelete?.name}</strong> ({toDelete?.email}) {t("users.deleteAccountDesc")}
          </>
        }
        confirmLabel={t("users.deleteAccountConfirm")}
        danger
        loading={deleting}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
      <CreateStaffDialog open={creating} onClose={() => setCreating(false)} onCreated={() => mutate()} t={t} />
    </>
  );
}

function CreateStaffDialog({ open, onClose, onCreated, t }: { open: boolean; onClose: () => void; onCreated: () => void; t: any }) {
  const toast = useToast();
  const empty = { name: "", email: "", password: "", role: "MODERATOR" as "MODERATOR" | "ADMIN" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const close = () => {
    setForm(empty);
    setError(null);
    onClose();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (form.name.trim().length < 2) return setError(t("users.nameMin2"));
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError(t("users.emailValid"));
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) return setError(t("users.passwordReq"));
    setSaving(true);
    setError(null);
    try {
      await api("/admin/users", { method: "POST", body: form });
      toast(t("users.accountCreated", { label: t(`common.${form.role.toLowerCase()}`), name: form.name }));
      onCreated();
      close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("users.couldNotCreate"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t("users.createStaff")}
      footer={
        <>
          <Button variant="secondary" onClick={close}>{t("common.cancel")}</Button>
          <Button onClick={() => submit()} loading={saving}>{t("users.createAccount")}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">{t("users.staffLimits")}</p>
        <Field label={t("users.roleLabel")} htmlFor="s-role">
          <Select id="s-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "MODERATOR" | "ADMIN" })}>
            <option value="MODERATOR">{t("users.moderator")}</option>
            <option value="ADMIN">{t("users.administrator")}</option>
          </Select>
        </Field>
        <Field label={t("users.fullName")} htmlFor="s-name">
          <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={t("users.email")} htmlFor="s-email">
          <Input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label={t("users.temporaryPassword")} htmlFor="s-pw" hint={t("users.temporaryPasswordHint")}>
          <PasswordInput id="s-pw" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <PasswordChecklist password={form.password} />
        </Field>
        <FormError message={error} />
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
