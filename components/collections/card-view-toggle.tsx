"use client";

import { cn } from "cn";

import { setCardView, useCardView } from "@/lib/collections/client";
import type { CardView } from "@/lib/collections/types";

const OPTIONS: Array<{ label: string; value: CardView }> = [
  { label: "model", value: "model" },
  { label: "image", value: "image" },
  { label: "item", value: "item" },
];

export function CardViewToggle({ className }: { className?: string }) {
  const view = useCardView();

  return (
    <div
      aria-label="Card view"
      className={cn("flex shrink-0 items-center", className)}
      role="group"
    >
      {OPTIONS.map((option) => (
        <button
          aria-pressed={view === option.value}
          className="type-chip focus-ring flex h-9 cursor-pointer items-center px-1.5 text-ink-muted transition-colors data-[active=true]:text-ink"
          data-active={view === option.value}
          key={option.value}
          onClick={() => setCardView(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
