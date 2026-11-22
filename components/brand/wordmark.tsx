import { cn } from "cn";
import Image from "next/image";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

const SRC = "/brand/wordmark.svg";
const WIDTH = 303;
const HEIGHT = 24;

const VARIANT_CLASS = {
  bar: "w-[196.5px]",
  footer: "w-[249px]",
  nav: "w-[196.5px] desktop:w-[303px]",
} as const;

export type WordmarkVariant = keyof typeof VARIANT_CLASS;

interface WordmarkProps {
  className?: string;
  variant: WordmarkVariant;
}

export function Wordmark({ className, variant }: WordmarkProps) {
  return (
    <Link
      aria-label={shopConfig.site.name}
      className={cn("flex min-h-9 shrink-0 items-center", className)}
      data-wordmark={variant}
      href="/"
    >
      <Image
        alt={shopConfig.site.name}
        className={cn("h-auto", VARIANT_CLASS[variant])}
        height={HEIGHT}
        sizes="100vw"
        src={SRC}
        unoptimized
        width={WIDTH}
      />
    </Link>
  );
}
