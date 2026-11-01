import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight",
  {
    variants: {
      variant: {
        default:
          "bg-cyan text-primary-foreground hover:bg-cyan-bright shadow-[0_0_0_1px_rgb(34_211_238/0.4),0_8px_24px_-8px_rgb(34_211_238/0.6)]",
        secondary: "bg-navy-700 text-text hover:bg-navy-700/80 border border-line-strong",
        outline:
          "border border-line-strong bg-transparent text-text-2 hover:text-text hover:border-cyan/50 hover:bg-cyan/5",
        ghost: "text-text-2 hover:text-text hover:bg-white/5",
        link: "text-cyan underline-offset-4 hover:underline",
        violet:
          "bg-violet text-white hover:bg-violet-bright shadow-[0_0_0_1px_rgb(139_92_246/0.4),0_8px_24px_-8px_rgb(139_92_246/0.6)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        xs: "h-7 rounded gap-1 px-2.5 text-[11px] has-[>svg]:px-2",
        lg: "h-11 rounded-md px-6 text-[15px] has-[>svg]:px-5",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
