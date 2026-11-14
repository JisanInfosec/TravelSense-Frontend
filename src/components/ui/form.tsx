"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 disabled:bg-canvas aria-[invalid=true]:border-danger";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  optional,
  optionalLabel = "Optional",
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  optional?: boolean;
  optionalLabel?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">{optionalLabel}</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "min-h-28 resize-y", props.className)} />;
}

function normalizeValue(value: React.SelectHTMLAttributes<HTMLSelectElement>["value"]) {
  if (value === undefined || value === null) return undefined;
  return String(value);
}

export function Select({
  className,
  wrapperClassName,
  value,
  defaultValue,
  onChange,
  onValueChange,
  children,
  placeholder,
  disabled,
  name,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  id,
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
  onValueChange?: (value: string) => void;
  placeholder?: React.ReactNode;
}) {
  const options = React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child) || child.type !== "option") return [];
    const props = child.props as React.OptionHTMLAttributes<HTMLOptionElement> & { children?: React.ReactNode };
    return [{ value: String(props.value ?? ""), label: props.children, disabled: props.disabled }];
  });

  const controlled = value !== undefined;
  const normalized = normalizeValue(controlled ? value : defaultValue) ?? "";
  const [internal, setInternal] = React.useState(normalized);
  React.useEffect(() => {
    if (!controlled) setInternal(normalized);
  }, [controlled, normalized]);
  const current = controlled ? normalized : internal;

  const handleChange = (next: string) => {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
    onChange?.({ target: { value: next, name } } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <SelectRoot value={current} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger id={id} aria-label={ariaLabel} aria-invalid={ariaInvalid} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  );
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input type="checkbox" {...props} className="size-4 rounded border-line accent-brand" />
      {label}
    </label>
  );
}

export function FormError({ message }: { message?: React.ReactNode }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
