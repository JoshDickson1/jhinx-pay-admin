import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-orange-500 text-primary-foreground hover:bg-orange-600",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive/15 text-destructive border-destructive/20",
        outline: "text-foreground",
        success: "bg-success/12 text-[hsl(107,94%,45%)] border-success/20",
        warning: "bg-orange-100/15 text-orange-500 border-orange-500/20",
        error: "bg-destructive/12 text-[hsl(0,100%,55%)] border-destructive/20",
        info: "bg-info/12 text-[hsl(199,89%,58%)] border-info/20",
        accent: "bg-orange-500/12 text-orange-500 border-orange-500/20",
        tier0: "bg-secondary text-muted-foreground border-border",
        tier1: "bg-info/12 text-[hsl(199,89%,58%)] border-info/20",
        tier2: "bg-orange-500/12 text-orange-500 border-orange-500/20",
        active: "bg-success/12 text-[hsl(107,94%,45%)] border-success/20",
        frozen: "bg-info/12 text-[hsl(199,89%,58%)] border-info/20",
        banned: "bg-destructive/12 text-[hsl(0,100%,55%)] border-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
