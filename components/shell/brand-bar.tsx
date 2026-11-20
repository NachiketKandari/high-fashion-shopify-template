import { cn } from "cn";

import { Wordmark, type WordmarkVariant } from "@/components/brand/wordmark";

interface BrandBarProps {
  className?: string;
  variant?: Extract<WordmarkVariant, "bar" | "bar-logo">;
}

export function BrandBar({ className, variant = "bar" }: BrandBarProps) {
  return (
    <header
      className={cn(
        "flex h-15 shrink-0 items-center justify-center border-b border-rule bg-paper",
        className,
      )}
    >
      <Wordmark priority variant={variant} />
    </header>
  );
}
