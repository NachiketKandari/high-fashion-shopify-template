import { cn } from "cn";
import Image from "next/image";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

const SRC = "/brand/wordmark.png";
const WIDTH = 950;
const HEIGHT = 82;

export type WordmarkVariant = "bar" | "footer" | "nav";

interface WordmarkProps {
  className?: string;
  variant: WordmarkVariant;
}

export function Wordmark({ className, variant }: WordmarkProps) {
  const linkClass = cn("flex min-h-9 shrink-0 items-center", className);

  if (variant === "nav" || variant === "bar") {
    return (
      <Link
        aria-label={shopConfig.site.name}
        className={linkClass}
        data-wordmark={variant}
        href="/"
      >
        <span className="type-wordmark font-sans">{shopConfig.site.name}</span>
      </Link>
    );
  }

  return (
    <Link aria-label={shopConfig.site.name} className={linkClass} data-wordmark="footer" href="/">
      <Image
        alt={shopConfig.site.name}
        className="h-auto w-[249px]"
        height={HEIGHT}
        sizes="100vw"
        src={SRC}
        width={WIDTH}
      />
    </Link>
  );
}
