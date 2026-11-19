import { cn } from "cn";
import type { ComponentProps } from "react";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-ink placeholder:text-ink-muted selection:bg-ink selection:text-inverse border-input type-body flex h-10 w-full min-w-0 rounded-control border bg-transparent px-3 py-1 transition-colors duration-(--motion-fast) focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error-rule aria-invalid:bg-error-soft",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
