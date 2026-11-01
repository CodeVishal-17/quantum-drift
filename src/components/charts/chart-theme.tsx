"use client";

import * as React from "react";
import type { TooltipContentProps } from "recharts";

import { cn, fdate } from "@/lib/utils";

export const CHART = {
  cyan: "#22d3ee",
  cyanBright: "#5ee7ff",
  violet: "#8b5cf6",
  violetBright: "#a78bfa",
  amber: "#f5b544",
  rose: "#fb7185",
  emerald: "#34d399",
  grid: "rgb(156 178 214 / 0.08)",
  axis: "rgb(156 178 214 / 0.18)",
  tick: "#6f7d94",
  muted: "#4b586d",
} as const;

export const AXIS_PROPS = {
  stroke: CHART.axis,
  tick: { fill: CHART.tick, fontSize: 10.5, fontFamily: "var(--font-geist-mono)" },
  tickLine: false,
  axisLine: { stroke: CHART.axis },
} as const;

export function timeTick(t: number) {
  return fdate.short(t);
}

export type TooltipRow = { label: string; value: React.ReactNode; color?: string; mono?: boolean };

export function TooltipFrame({
  title,
  rows,
  footer,
  className,
}: {
  title: React.ReactNode;
  rows: TooltipRow[];
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-[180px] rounded-md border border-line-strong bg-navy-800/95 px-3 py-2.5 text-xs shadow-2xl backdrop-blur-md",
        className,
      )}
    >
      <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-3">{title}</div>
      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-text-3">
              {r.color && <span className="size-1.5 rounded-full" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className={cn("tabular text-text", r.mono !== false && "font-mono")}>{r.value}</span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-2 border-t border-line pt-2 text-[11px] text-text-4">{footer}</div>}
    </div>
  );
}

/** Generic Recharts tooltip renderer using our frame. */
export function makeTooltip<TPayload extends object>(
  render: (payload: TPayload, label: unknown) => { title: React.ReactNode; rows: TooltipRow[]; footer?: React.ReactNode } | null,
) {
  return function ChartTooltip(props: Partial<TooltipContentProps<number, string>>) {
    const { active, payload, label } = props;
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload as TPayload | undefined;
    if (!p) return null;
    const content = render(p, label);
    if (!content) return null;
    return <TooltipFrame {...content} />;
  };
}

export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string; dashed?: boolean }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-text-3", className)}>
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-0 w-4 border-t-2"
            style={{ borderColor: i.color, borderStyle: i.dashed ? "dashed" : "solid" }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}
