import { cn } from "cn";
import type { ComponentPropsWithRef } from "react";

export function Container({ children, className, ...props }: ComponentPropsWithRef<"section">) {
  return (
    <section className={cn("mx-auto w-full px-5 md:px-[30px]", className)} {...props}>
      {children}
    </section>
  );
}
