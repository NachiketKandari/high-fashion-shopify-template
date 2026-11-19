"use client";

import { cn } from "cn";
import { Columns2, Grid2x2 } from "lucide-react";

import { setCardDensity, useCardDensity } from "@/lib/collections/client";
import type { CardDensity } from "@/lib/collections/types";

const OPTIONS: Array<{
  icon: typeof Columns2;
  label: string;
  value: CardDensity;
}> = [
  { icon: Columns2, label: "Large image view", value: "gallery" },
  { icon: Grid2x2, label: "Compact grid view", value: "compact" },
];

export function CardDensityToggle({ className }: { className?: string }) {
  const density = useCardDensity();

  return (
    <div
      aria-label="Product grid density"
      className={cn("flex shrink-0 items-center gap-1", className)}
      role="group"
    >
      {OPTIONS.map(({ icon: Icon, label, value }) => (
        <button
          aria-label={label}
          aria-pressed={density === value}
          className="focus-ring flex size-9 cursor-pointer items-center justify-center text-ink-muted transition-colors data-[active=true]:text-ink"
          data-active={density === value}
          key={value}
          onClick={() => setCardDensity(value)}
          type="button"
        >
          <Icon className="size-5" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
