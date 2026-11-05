import { cn } from "cn";
import Image from "next/image";
import type { ComponentProps } from "react";

interface SwatchProps extends ComponentProps<"span"> {
  color?: string;
  image?: string;
  label: string;
  selected?: boolean;
}

export function Swatch({
  color,
  image,
  label,
  selected = false,
  className,
  ...props
}: SwatchProps) {
  return (
    <span
      data-slot="swatch"
      data-selected={selected}
      className={cn("flex size-9 shrink-0 items-center justify-center", className)}
      {...props}
    >
      <span
        data-slot="swatch-visual"
        title={label}
        className={cn(
          "relative block size-2.5 overflow-hidden rounded-none transition-colors duration-(--motion-fast)",
          "after:pointer-events-none after:absolute after:inset-0 after:ring-1 after:ring-ink/10",
          "data-[selected=true]:ring-1 data-[selected=true]:ring-ink data-[selected=true]:ring-offset-1 data-[selected=true]:ring-offset-paper",
        )}
        data-selected={selected}
      >
        {image ? (
          <Image
            src={image}
            width={200}
            height={200}
            sizes="100vw"
            alt={label}
            className="size-full object-cover"
          />
        ) : (
          <span
            className="block size-full bg-surface"
            style={color ? { backgroundColor: color } : undefined}
          />
        )}
      </span>
    </span>
  );
}
