import { cn } from "cn";
import Image from "next/image";

import { Link } from "@/components/ui/link";

interface MediaTileProps {
  className?: string;
  href: string;
  image: string;
  label?: string;
  labelTone?: "ink" | "inverse";
  priority?: boolean;
  watermark?: string;
}

export function MediaTile({
  className,
  href,
  image,
  label,
  labelTone = "ink",
  priority = false,
  watermark,
}: MediaTileProps) {
  return (
    <Link className={cn("group relative block overflow-hidden bg-surface", className)} href={href}>
      <Image
        alt=""
        className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transform-none"
        fill
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        sizes="100vw"
        src={image}
      />
      {watermark ? (
        <span
          aria-hidden="true"
          className="type-display desktop:type-watermark pointer-events-none absolute bottom-4 left-(--gutter) text-inverse/50"
        >
          {watermark}
        </span>
      ) : null}
      {label ? (
        <span
          className={cn(
            "type-h3 absolute inset-x-0 bottom-0 px-(--gutter) pt-12 pb-5",
            labelTone === "inverse"
              ? "bg-gradient-to-t from-black/45 to-transparent text-inverse"
              : "text-ink",
          )}
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}
