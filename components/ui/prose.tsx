import { cn } from "cn";
import type { ComponentProps } from "react";

export function Prose({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "prose prose-neutral max-w-none prose-headings:font-normal prose-headings:uppercase prose-headings:tracking-[0.05em] prose-p:font-light prose-p:tracking-[0.05em]",
        className,
      )}
      {...props}
    />
  );
}
