import { cn } from "cn";
import Image from "next/image";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

const SRC = "/brand/wordmark.png";
const WIDTH = 950;
const HEIGHT = 82;

const VARIANTS = {
  footer: "w-[315px]",
  nav: "w-[125px]",
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
