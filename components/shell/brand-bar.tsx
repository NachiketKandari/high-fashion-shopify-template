import { cn } from "cn";

import { Wordmark } from "@/components/brand/wordmark";

interface BrandBarProps {
  className?: string;
}

export function BrandBar({ className }: BrandBarProps) {
  return (
    <header
      className={cn(
        "flex h-15 shrink-0 items-center justify-center border-b border-rule bg-paper",
        className,
      )}
    >
      <Wordmark priority variant="bar" />
    </header>
  );
}
