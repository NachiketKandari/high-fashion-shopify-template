import { cn } from "cn";
import type { ComponentProps } from "react";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-surface motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
