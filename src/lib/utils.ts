import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- number formatting ---------- */

export const fmt = {
  /** Readout error as a 4–6 dp probability. */
  err(n: number | null | undefined, dp = 4) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return n.toFixed(dp);
  },
  /** Readout error as percentage. */
  pct(n: number | null | undefined, dp = 2) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return `${(n * 100).toFixed(dp)}%`;
  },
  int(n: number | null | undefined) {
    if (n === null || n === undefined) return "—";
    return new Intl.NumberFormat("en-US").format(n);
  },
  compact(n: number) {
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  },
  metric(n: number, dp = 6) {
    return n.toFixed(dp);
  },
  hours(h: number | null | undefined) {
    if (h === null || h === undefined) return "—";
    if (h < 1) return `${Math.round(h * 60)} min`;
    if (h < 48) return `${h.toFixed(1)} h`;
    return `${(h / 24).toFixed(1)} d`;
  },
  seconds(s: number | null | undefined) {
    if (s === null || s === undefined) return "—";
    if (s < 3600) return `${Math.round(s / 60)} min`;
    return `${(s / 3600).toFixed(1)} h`;
  },
  signed(n: number | null | undefined, dp = 4) {
    if (n === null || n === undefined) return "—";
    return `${n > 0 ? "+" : ""}${n.toFixed(dp)}`;
  },
};

/* ---------- date formatting (UTC, deterministic for SSR) ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export const fdate = {
  short(iso: string | number) {
    const d = new Date(iso);
    return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]}`;
  },
  dayTime(iso: string | number) {
    const d = new Date(iso);
    return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  },
  full(iso: string | number) {
    const d = new Date(iso);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
  },
  iso(iso: string | number) {
    return new Date(iso).toISOString();
  },
  monthYear(iso: string | number) {
    const d = new Date(iso);
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  },
};

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
