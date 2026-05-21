import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ as: Comp = "div", className, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn(
          "rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

