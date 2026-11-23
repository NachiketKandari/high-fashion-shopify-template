import { cn } from "cn";
import type { ComponentProps } from "react";

export function AccountCard({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("border border-rule p-6", className)} {...props} />;
}
