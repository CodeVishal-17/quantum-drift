import { cn } from "@/lib/utils";

/** QubitWatch mark: a single-colour Bloch-sphere outline with one state point. */
export function LogoMark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("shrink-0 text-cyan", className)}>
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      <ellipse cx="16" cy="16" rx="12.5" ry="4.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="22.8" cy="8.6" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-text">
        Qubit<span className="text-cyan">Watch</span>
      </span>
    </span>
  );
}
