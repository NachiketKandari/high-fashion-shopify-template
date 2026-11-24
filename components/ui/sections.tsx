import { cn } from "cn";
import type { ComponentPropsWithRef } from "react";

export function Sections({ children, className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("grid grid-cols-1 gap-(--section-gap)", className)} {...props}>
      {children}
    </div>
  );
}
