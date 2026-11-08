import { cn } from "cn";
import type { ComponentProps } from "react";

import { Link } from "@/components/ui/link";
import type { OptionGroupState } from "@/lib/product/types";

import { SizeGuide } from "./size-guide";

interface OptionPickerProps extends ComponentProps<"div"> {
  compact?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
  sizeGuideCategory?: string;
}

export function OptionPicker({
  onSelectValue,
  option,
  className,
  compact = false,
  sizeGuideCategory,
  ...props
}: OptionPickerProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 gap-y-2", className)} {...props}>
      <span className={cn("type-h4 shrink-0", compact ? "w-11" : "w-full desktop:w-16")}>
        {option.name}
      </span>
      <div
        className={cn(
          "flex flex-1 flex-wrap items-center gap-y-2",
          compact ? "gap-x-1" : "gap-x-2",
        )}
      >
        {option.values.map((value) => {
          const classes = cn(
            "type-body-sm focus-ring inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center font-normal transition-colors",
            !value.exists
              ? "cursor-not-allowed text-ink-muted/50 line-through"
              : value.selected
                ? "text-ink"
                : "text-ink-muted hover:text-ink",
            value.exists && !value.available && "cursor-not-allowed line-through opacity-50",
          );
          const label = (
            <span
              className={cn(
                "border-b pb-0.5",
                value.selected ? "border-ink" : "border-transparent",
              )}
            >
              {value.name}
            </span>
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
                {label}
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
              {label}
            </Link>
          );
        })}
      </div>
      {option.name.toLowerCase().includes("size") ? (
        <SizeGuide category={sizeGuideCategory} />
      ) : null}
    </div>
  );
}
