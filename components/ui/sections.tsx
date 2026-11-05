import { cn } from "cn";
import type { ComponentPropsWithRef } from "react";

export function Sections({ children, className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("grid gap-(--section-gap)", className)} {...props}>
      {children}
    </div>
  );
}
