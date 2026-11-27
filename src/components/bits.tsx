import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="15" className="fill-primary" />
      <path d="M14 40c6-16 30-16 36 0" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-brand-bright" />
      <circle cx="14" cy="42" r="5" className="fill-primary-foreground" />
      <circle cx="50" cy="42" r="5" className="fill-primary-foreground" />
    </svg>
  );
}

export function ScoreRing({
  value,
  size = 136,
  onDark = false,
  label,
}: {
  value: number;
  size?: number;
  onDark?: boolean;
  label: string;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${label}: ${value}/100`} className="shrink-0">
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className={onDark ? "stroke-primary-foreground/15" : "stroke-muted"} />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform="rotate(-90 60 60)"
        className={cn("transition-[stroke-dashoffset] duration-500", onDark ? "stroke-brand-bright" : "stroke-brand")}
      />
      <text x="60" y="64" textAnchor="middle" className={cn("font-display text-[30px] font-bold", onDark ? "fill-primary-foreground" : "fill-foreground")}>
        {value}
      </text>
      <text x="60" y="82" textAnchor="middle" className={cn("text-[10px]", onDark ? "fill-primary-foreground/70" : "fill-muted-foreground")}>
        / 100
      </text>
    </svg>
  );
}

export function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <header className="mb-8 max-w-3xl">
      <p className="eyebrow text-brand-strong">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-3 text-base text-muted-foreground">{sub}</p>
    </header>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <Field label={label}>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label
      className={cn(
        "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border p-3 text-sm transition-colors",
        checked ? "border-brand/40 bg-brand-soft" : "border-border bg-card hover:bg-muted",
      )}
    >
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
          checked ? "border-brand bg-brand text-brand-foreground" : "border-input bg-card",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className={cn("min-w-0 leading-relaxed", checked ? "text-accent-foreground" : "text-foreground")}>{children}</span>
    </label>
  );
}

export function Pill({ tone = "muted", children }: { tone?: "muted" | "brand" | "warn" | "navy" | "danger"; children: ReactNode }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    brand: "bg-brand-soft text-brand-strong",
    warn: "bg-warn-soft text-warn",
    navy: "bg-primary text-primary-foreground",
    danger: "bg-destructive/10 text-destructive",
  };
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}
