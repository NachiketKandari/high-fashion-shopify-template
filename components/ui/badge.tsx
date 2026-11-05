import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "type-label inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border px-2 py-0.5 whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3 focus-ring",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-inverse [a&]:hover:bg-ink/80",
        secondary: "border-transparent bg-surface text-ink [a&]:hover:bg-rule",
        destructive: "border-error-rule bg-error-soft text-error-rule [a&]:hover:bg-error/10",
        outline: "border-rule bg-transparent text-ink [a&]:hover:bg-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps extends useRender.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

function Badge({ className, render, variant, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    render,
    state: { slot: "badge" },
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
  });
}

export { Badge };
