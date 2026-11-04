import { cn } from "cn";
import type { ComponentProps } from "react";

import { Link } from "@/components/ui/link";
import type { OptionGroupState } from "@/lib/product/types";

import { SizeGuide } from "./size-guide";

interface OptionPickerProps extends ComponentProps<"div"> {
  compact?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

export function OptionPicker({ onSelectValue, option, className, ...props }: OptionPickerProps) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <span className="w-16 shrink-0 text-2xs uppercase tracking-wider">{option.name}</span>
      <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        {option.values.map((value) => {
          const classes = cn(
            "text-2xs uppercase leading-4 tracking-wider transition-colors",
            !value.exists
              ? "cursor-not-allowed text-muted-foreground/50 line-through"
              : value.selected
                ? "border-b border-foreground pb-0.5 text-foreground"
                : "text-foreground hover:opacity-60",
            value.exists && !value.available && "line-through opacity-50",
          );

          if (!value.exists) {
            return (
              <button
                aria-label={`${option.name}: ${value.name} (unavailable)`}
                className={classes}
                disabled
                key={value.name}
                type="button"
              >
                {value.name}
              </button>
            );
          }

          return (
            <Link
              aria-current={value.selected ? "true" : undefined}
              aria-label={value.available ? undefined : `${option.name}: ${value.name} (sold out)`}
              className={classes}
              href={value.href}
              key={value.name}
              onClick={
                onSelectValue && !value.crossProduct
                  ? (event) => {
                      event.preventDefault();
                      onSelectValue(option.name, value.name);
                    }
                  : undefined
              }
              scroll={false}
            >
              {value.name}
            </Link>
          );
        })}
      </div>
      {option.name.toLowerCase().includes("size") ? <SizeGuide /> : null}
    </div>
  );
}
