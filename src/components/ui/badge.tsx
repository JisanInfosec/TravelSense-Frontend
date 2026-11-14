"use client";

import { CircleCheck, Clock3, ShieldAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

type Tone = "green" | "neutral" | "warn" | "danger" | "info" | "glass";
const tones: Record<Tone, string> = {
  green: "bg-leaf text-brand-dark",
  neutral: "bg-canvas text-muted border border-line",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  glass: "bg-white/90 text-brand-dark backdrop-blur",
};

export function Badge({ tone = "green", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ReviewStatus, { tone: Tone; labelKey: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { tone: "warn", labelKey: "reviewStatus.PENDING", icon: Clock3 },
  APPROVED: { tone: "green", labelKey: "reviewStatus.APPROVED", icon: CircleCheck },
  REJECTED: { tone: "danger", labelKey: "reviewStatus.REJECTED", icon: XCircle },
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const { t } = useTranslation();
  const map = STATUS_TONE[status];
  return (
    <Badge tone={map.tone}>
      <map.icon className="size-3.5" /> {t(map.labelKey)}
    </Badge>
  );
}

/** Distinguishes demonstration content from information verified by the project owner. */
export function VerificationBadge({ verified, className }: { verified: boolean; className?: string }) {
  const { t } = useTranslation();
  return verified ? (
    <Badge tone="green" className={className}>
      <CircleCheck className="size-3.5" /> {t("badge.verified")}
    </Badge>
  ) : (
    <Badge tone="warn" className={className}>
      <ShieldAlert className="size-3.5" /> {t("badge.demoContent")}
    </Badge>
  );
}
