import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

import { Link } from "@/components/ui/link";
import type { OptionGroupState } from "@/lib/product/types";

import { SizeGuide } from "./size-guide";

interface OptionPickerProps extends ComponentProps<"div"> {
  compact?: boolean;
  footnote?: ReactNode;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
  sizeGuideCategory?: string;
}

export function OptionPicker({
  onSelectValue,
  option,
  className,
  compact = false,
  footnote,
  sizeGuideCategory,
  ...props
}: OptionPickerProps) {
  const isSize = option.name.toLowerCase().includes("size");
  return (
    <div className={cn("grid gap-3", className)} {...props}>
      <div className="flex items-center justify-between gap-3">
        <span className="type-control text-ink-strong">{option.name}</span>
        {isSize ? <SizeGuide category={sizeGuideCategory} /> : null}
      </div>
      <div className={cn("flex flex-wrap gap-3", compact && "gap-x-1 gap-y-1")}>
        {option.values.map((value) => {
          const targetClass = "focus-ring inline-flex min-h-9 min-w-9 cursor-pointer items-center";
          const boxClass = cn(
            "inline-flex items-center justify-center border transition-colors",
            compact
              ? "type-body-sm min-h-8 px-2"
              : "type-label min-h-[26px] px-1.5 desktop:h-11 desktop:px-4",
            value.selected && value.available
              ? "border-ink bg-ink text-inverse desktop:border-rule"
              : value.exists && value.available
                ? "border-ink text-ink desktop:border-rule desktop:text-ink-muted desktop:group-hover:border-ink desktop:group-hover:text-ink"
                : "border-rule bg-surface text-ink-muted line-through",
          );
          const label = <span className={boxClass}>{value.name}</span>;

          if (!value.exists || !value.available) {
            return (
              <button
                aria-label={`${option.name}: ${value.name} (unavailable)`}
                className={cn(targetClass, "cursor-not-allowed")}
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
              className={cn("group", targetClass)}
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
      {footnote ? <p className="type-control pt-3 text-ink">{footnote}</p> : null}
    </div>
  );
}
