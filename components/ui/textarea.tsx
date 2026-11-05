import { cn } from "cn";
import type { ComponentProps } from "react";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-ink-muted type-body flex field-sizing-content min-h-24 w-full rounded-none border bg-transparent px-2.5 py-2 transition-colors duration-(--motion-fast) focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error-rule aria-invalid:bg-error-soft",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
