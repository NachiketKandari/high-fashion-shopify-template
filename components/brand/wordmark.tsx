import { cn } from "cn";
import Image from "next/image";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

const SRC = "/brand/wordmark.svg";
const WIDTH = 149.354;
const HEIGHT = 12.054;

const VARIANTS = {
  compact: "w-[170px] desktop:w-[342px]",
  footer: "w-[315px]",
  masthead: "w-[min(1016px,calc(100vw-2*var(--gutter)))]",
  menu: "w-[210px]",
} as const;

export type WordmarkVariant = keyof typeof VARIANTS;

interface WordmarkProps {
  className?: string;
  priority?: boolean;
  variant: WordmarkVariant;
}

export function Wordmark({ className, priority = false, variant }: WordmarkProps) {
  return (
    <Link
      aria-label={shopConfig.site.name}
      className={cn("flex min-h-9 shrink-0 items-center", className)}
      data-wordmark={variant}
      href="/"
    >
      <Image
        alt={shopConfig.site.name}
        className={cn("h-auto", VARIANTS[variant])}
        height={HEIGHT}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        sizes="100vw"
        src={SRC}
        width={WIDTH}
      />
    </Link>
  );
}
