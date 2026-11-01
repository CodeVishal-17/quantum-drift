import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-cyan/40 bg-cyan/10 text-cyan",
        violet: "border-violet/40 bg-violet/10 text-violet-bright",
        amber: "border-amber/40 bg-amber/10 text-amber",
        rose: "border-rose/40 bg-rose/10 text-rose",
        emerald: "border-emerald/40 bg-emerald/10 text-emerald",
        outline: "border-line-strong text-text-2",
        muted: "border-transparent bg-white/5 text-text-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
