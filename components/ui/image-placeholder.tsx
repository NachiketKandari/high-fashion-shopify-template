import { cn } from "cn";
import { ImageIcon } from "lucide-react";
import type { ComponentProps } from "react";

interface ImagePlaceholderProps extends ComponentProps<"div"> {
  iconClassName?: string;
}

function ImagePlaceholder({ className, iconClassName, ...props }: ImagePlaceholderProps) {
  return (
    <div
      data-slot="image-placeholder"
      className={cn("flex items-center justify-center bg-surface", className)}
      {...props}
    >
      <ImageIcon
        aria-hidden
        strokeWidth={1.25}
        className={cn("h-auto w-1/3 max-w-40 text-ink-muted/30", iconClassName)}
      />
    </div>
  );
}

export { ImagePlaceholder };
