"use client";

import { cn } from "cn";
import { LayoutGrid, RectangleVertical, StretchVertical, type LucideIcon } from "lucide-react";

import { setCardDensity, useCardDensity } from "@/lib/collections/client";
import type { CardDensity } from "@/lib/collections/types";

const OPTIONS: Array<{
  desktopIcon: LucideIcon;
  label: string;
  mobileIcon: LucideIcon;
  value: CardDensity;
}> = [
  {
    desktopIcon: StretchVertical,
    label: "Large image view",
    mobileIcon: RectangleVertical,
    value: "gallery",
  },
  {
    desktopIcon: LayoutGrid,
    label: "Compact grid view",
    mobileIcon: StretchVertical,
    value: "compact",
  },
];

export function CardDensityToggle({ className }: { className?: string }) {
  const density = useCardDensity();

  return (
    <div
      aria-label="Product grid density"
      className={cn("flex shrink-0 items-center gap-1", className)}
      role="group"
    >
      {OPTIONS.map(({ desktopIcon: DesktopIcon, label, mobileIcon: MobileIcon, value }) => (
        <button
          aria-label={label}
          aria-pressed={density === value}
          className="focus-ring flex size-9 cursor-pointer items-center justify-center text-ink-muted transition-colors data-[active=true]:text-ink"
          data-active={density === value}
          key={value}
          onClick={() => setCardDensity(value)}
          type="button"
        >
          <MobileIcon className="size-5 desktop:hidden" strokeWidth={1.5} />
          <DesktopIcon className="hidden size-5 desktop:block" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
