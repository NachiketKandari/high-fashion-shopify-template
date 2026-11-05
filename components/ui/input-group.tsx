"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function InputGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "group/input-group border-input relative flex w-full items-center rounded-none border transition-colors duration-(--motion-fast)",
        "h-9 min-w-0 has-[>textarea]:h-auto",
        "has-[[data-slot=input-group-control]:focus-visible]:border-ink has-[[data-slot=input-group-control]:focus-visible]:outline-2 has-[[data-slot=input-group-control]:focus-visible]:outline-offset-2 has-[[data-slot=input-group-control]:focus-visible]:outline-ink",
        "has-[[data-slot][aria-invalid=true]]:border-error-rule has-[[data-slot][aria-invalid=true]]:bg-error-soft",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva("type-control flex items-center gap-2 rounded-none", {
  variants: {
    size: {
      xs: "h-9 gap-1 px-2 [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
      sm: "h-9 px-2.5 gap-1.5 has-[>svg]:px-2.5",
      "icon-xs": "size-9 p-0 has-[>svg]:p-0",
      "icon-sm": "size-9 p-0 has-[>svg]:p-0",
    },
  },
  defaultVariants: {
    size: "xs",
  },
});

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2.5 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupButton, InputGroupTextarea };
