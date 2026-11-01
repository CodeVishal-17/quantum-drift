import * as React from "react";
import { cn } from "@/lib/utils";

/** Thin-bordered content surface. */
export function Panel({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("surface", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({
  className,
  title,
  eyebrow,
  description,
  actions,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-3.5", className)} {...props}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h3 className="text-sm font-medium leading-tight text-text">{title}</h3>
        {description && <p className="mt-1 max-w-prose text-xs leading-relaxed text-text-3">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function PanelFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return <footer className={cn("flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-2.5", className)} {...props} />;
}
