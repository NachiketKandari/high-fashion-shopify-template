import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { ComponentProps } from "react";

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-ink *:data-[slot=bubble-content]:text-inverse [&>[data-slot=bubble-content]:is(button,a):hover]:bg-ink/80",
        secondary:
          "*:data-[slot=bubble-content]:bg-surface *:data-[slot=bubble-content]:text-ink [&>[data-slot=bubble-content]:is(button,a):hover]:bg-rule",
        muted:
          "*:data-[slot=bubble-content]:bg-surface *:data-[slot=bubble-content]:text-ink [&>[data-slot=bubble-content]:is(button,a):hover]:bg-rule",
        tinted:
          "*:data-[slot=bubble-content]:bg-surface *:data-[slot=bubble-content]:text-ink [&>[data-slot=bubble-content]:is(button,a):hover]:bg-rule",
        outline:
          "*:data-[slot=bubble-content]:border-rule *:data-[slot=bubble-content]:bg-paper *:data-[slot=bubble-content]:text-ink [&>[data-slot=bubble-content]:is(button,a):hover]:bg-surface",
        ghost:
          "*:data-[slot=bubble-content]:border-0 *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-surface",
        destructive:
          "*:data-[slot=bubble-content]:border-error-rule *:data-[slot=bubble-content]:bg-error-soft *:data-[slot=bubble-content]:text-error-rule [&>[data-slot=bubble-content]:is(button,a):hover]:bg-error/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}: ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> & {
    align?: "start" | "end";
  }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant }), className)}
      {...props}
    />
  );
}

function BubbleContent({ className, render, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "type-body-sm w-fit max-w-full min-w-0 overflow-hidden rounded-none border border-transparent px-3 py-2 wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:focus-ring",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "bubble-content",
    },
  });
}

export { Bubble, BubbleContent };
