import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Large numeric readout with a technical label. Sizes scale from
 * compact table-style to hero-style display figures.
 */
export function Metric({
  label,
  value,
  unit,
  hint,
  size = "md",
  accent = "none",
  badge,
  className,
  trend,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  hint?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  accent?: "none" | "cyan" | "violet" | "amber";
  badge?: React.ReactNode;
  className?: string;
  trend?: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <span className="eyebrow leading-snug">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span
          className={cn(
            "tabular font-mono leading-none tracking-tight",
            size === "sm" && "text-lg",
            size === "md" && "text-2xl",
            size === "lg" && "text-[2.25rem]",
            size === "xl" && "text-5xl sm:text-6xl",
            accent === "none" && "text-text",
            accent === "cyan" && "text-cyan",
            accent === "violet" && "text-violet-bright",
            accent === "amber" && "text-amber",
          )}
        >
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-text-3">{unit}</span>}
        {trend}
      </div>
      {(hint || badge) && (
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1.5">
          {hint ? <div className="text-xs leading-snug text-text-3">{hint}</div> : <span />}
          {badge}
        </div>
      )}
    </div>
  );
}

export function StatusDot({
  tone = "cyan",
  pulse = false,
  className,
}: {
  tone?: "cyan" | "violet" | "amber" | "rose" | "emerald" | "muted";
  pulse?: boolean;
  className?: string;
}) {
  const color = {
    cyan: "bg-cyan",
    violet: "bg-violet-bright",
    amber: "bg-amber",
    rose: "bg-rose",
    emerald: "bg-emerald",
    muted: "bg-text-4",
  }[tone];
  return (
    <span className={cn("relative inline-flex size-2", className)}>
      {pulse && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-50", color)} />}
      <span className={cn("relative inline-flex size-2 rounded-full", color)} />
    </span>
  );
}
