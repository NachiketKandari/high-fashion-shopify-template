import { cn } from "cn";
import Image from "next/image";

import { Link } from "@/components/ui/link";

interface MediaTileProps {
  className?: string;
  href: string;
  image: string;
  label?: string;
  labelClassName?: string;
  priority?: boolean;
}

export function MediaTile({
  className,
  href,
  image,
  label,
  labelClassName,
  priority = false,
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
      {label ? (
        <span
          className={cn(
            "type-body-sm absolute inset-x-0 bottom-0",
            labelClassName ??
              "bg-gradient-to-t from-paper/85 via-paper/50 to-transparent px-9 pt-16 pb-6.5 text-ink",
          )}
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}
