"use client";

import { cn } from "cn";
import { Fragment } from "react";

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
      aria-label="Product image view"
      className={cn("flex shrink-0 items-center gap-2", className)}
      role="group"
    >
      {OPTIONS.map((option, index) => (
        <Fragment key={option.value}>
          {index > 0 ? (
            <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-rule-soft" />
          ) : null}
          <button
            aria-pressed={view === option.value}
            className="type-caption focus-ring flex h-9 min-w-9 cursor-pointer items-center justify-center text-ink-muted underline-offset-4 transition-colors data-[active=true]:text-ink data-[active=true]:underline"
            data-active={view === option.value}
            onClick={() => setCardView(option.value)}
            type="button"
          >
            {option.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
