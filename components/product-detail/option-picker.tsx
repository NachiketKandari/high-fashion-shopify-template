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

export function OptionPicker({
  onSelectValue,
  option,
  className,
  compact: _compact,
  ...props
}: OptionPickerProps) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <span className="type-h4 w-16 shrink-0">{option.name}</span>
      <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        {option.values.map((value) => {
          const classes = cn(
            "type-body-sm inline-flex min-h-9 min-w-9 items-center justify-center transition-colors",
            !value.exists
              ? "cursor-not-allowed text-ink-muted/50 line-through"
              : value.selected
                ? "border-b border-ink pb-0.5 text-ink"
                : "text-ink hover:opacity-60",
            value.exists && !value.available && "cursor-not-allowed line-through opacity-50",
          );

          if (!value.exists || (!value.available && !value.selected)) {
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
