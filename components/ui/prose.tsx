import { cn } from "cn";
import type { ComponentProps } from "react";

export function Prose({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "prose prose-sm prose-neutral max-w-none text-body text-ink-muted prose-headings:font-normal prose-headings:uppercase prose-headings:tracking-[0.05em] prose-h2:text-h2 prose-h3:text-h3 prose-h4:text-h4 prose-p:font-light prose-p:text-body prose-p:tracking-[0.05em] prose-li:font-light prose-li:text-body prose-li:tracking-[0.05em] prose-figcaption:text-body-sm",
        className,
      )}
      {...props}
    />
  );
}
