import { cn } from "cn";
import Image from "next/image";

import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";

const SRC = "/brand/wordmark.png";
const WIDTH = 950;
const HEIGHT = 82;

export type WordmarkVariant = "bar" | "bar-logo" | "footer" | "nav";

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

  if (variant === "bar" || variant === "bar-logo") {
    return (
      <Link aria-label={shopConfig.site.name} className={linkClass} data-wordmark="bar" href="/">
        <span
          className={
            variant === "bar-logo"
              ? "type-wordmark font-sans desktop:hidden"
              : "type-wordmark font-sans"
          }
        >
          {shopConfig.site.name}
        </span>
        {variant === "bar-logo" ? (
          <Image
            alt={shopConfig.site.name}
            className="hidden h-auto desktop:block desktop:w-[303px]"
            height={HEIGHT}
            priority={priority}
            sizes="100vw"
            src={SRC}
            width={WIDTH}
          />
        ) : null}
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
