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
  priority?: boolean;
  variant: WordmarkVariant;
}

export function Wordmark({ className, priority = false, variant }: WordmarkProps) {
  const linkClass = cn("flex min-h-9 shrink-0 items-center", className);

  if (variant === "nav") {
    return (
      <Link aria-label={shopConfig.site.name} className={linkClass} data-wordmark="nav" href="/">
        <Image
          alt={shopConfig.site.name}
          className="h-auto w-[194px] desktop:w-[303px]"
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

  if (variant === "bar") {
    return (
      <Link aria-label={shopConfig.site.name} className={linkClass} data-wordmark="bar" href="/">
        <span className="type-wordmark">Lorem Ipsum</span>
      </Link>
    );
  }

  return (
    <Link aria-label={shopConfig.site.name} className={linkClass} data-wordmark="footer" href="/">
      <span className="type-display-lg uppercase">Lorem Ipsum</span>
    </Link>
  );
}
