"use client";

import { LoaderCircle, PackageOpen, RefreshCw, X } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  loading,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button {...props} disabled={loading || props.disabled} className={`btn ${className} disabled:cursor-not-allowed disabled:opacity-60`}>
      {loading && <LoaderCircle className="animate-spin" size={16} />}
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const styles = {
    neutral: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-rose-50 text-rose-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[tone]}`}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card grid min-h-72 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-700">
          <PackageOpen size={22} />
        </span>
        <h2 className="mt-4 font-serif text-2xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="card p-8 text-center">
      <p className="font-medium">We couldn’t load this right now.</p>
      <p className="mt-1 text-sm text-slate-500">Check your connection and try again.</p>
      {onRetry && (
        <Button onClick={onRetry} className="btn-light mt-5">
          <RefreshCw size={16} /> Try again
        </Button>
      )}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{title}</h2>
          <button aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight sm:text-6xl">{title}</h1>
      {description && <p className="mt-4 max-w-xl text-slate-600">{description}</p>}
    </header>
  );
}
