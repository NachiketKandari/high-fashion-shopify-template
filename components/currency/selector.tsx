import { cn } from "cn";

import { DEFAULT_DISPLAY_CURRENCY } from "@/lib/money/display";

export function CurrencySelector({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <span className="sr-only">Currency </span>
      {DEFAULT_DISPLAY_CURRENCY}
    </span>
  );
}
