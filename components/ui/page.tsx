import { cn } from "cn";
import type { ComponentProps } from "react";

export function Page({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("pt-(--page-top)", className)} {...props}>
      {children}
    </div>
  );
}
