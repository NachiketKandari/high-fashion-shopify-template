import { cn } from "cn";
import type { ComponentProps } from "react";

interface DiscountBadgeProps extends ComponentProps<"span"> {
  percent: number;
}

export function DiscountBadge({ percent, className, ...props }: DiscountBadgeProps) {
  return (
    <span
      className={cn(
        "type-label inline-flex items-center border border-ink px-1.5 py-0.5 text-ink tabular-nums",
        className,
      )}
      {...props}
    >
      {percent}% off
    </span>
  );
}
