"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "focus-ring peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-none border border-input bg-surface transition-colors duration-(--motion-fast) data-checked:border-ink data-checked:bg-ink data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-none border border-rule bg-paper transition-transform duration-(--motion-fast) data-checked:translate-x-4 data-unchecked:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
