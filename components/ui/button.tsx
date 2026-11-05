import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "type-control inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-none border border-transparent px-5 transition-colors duration-(--motion-base) ease-(--ease-standard) focus-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-ink text-inverse hover:bg-ink/80",
        destructive: "border-error-rule bg-error-soft text-error-rule hover:bg-error/10",
        ghost: "text-ink hover:bg-surface",
        link: "h-auto border-0 bg-transparent p-0 text-ink underline underline-offset-4 hover:opacity-60",
        outline: "border-ink bg-paper text-ink hover:bg-surface",
        secondary: "bg-surface text-ink hover:bg-rule",
      },
      size: {
        default: "h-9 px-5",
        icon: "size-9 p-0",
        "icon-lg": "size-10 p-0",
        "icon-sm": "size-9 p-0",
        lg: "h-10 px-6",
        sm: "h-9 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends useRender.ComponentProps<"button">, VariantProps<typeof buttonVariants> {}

function Button({ className, render, size, variant, ...props }: ButtonProps) {
  return useRender({
    defaultTagName: "button",
    render,
    state: { slot: "button" },
    props: mergeProps<"button">(
      { className: cn(buttonVariants({ variant, size, className })) },
      props,
    ),
  });
}

export { Button };
