import { cn } from "cn";
import type { ComponentProps } from "react";

import { Link } from "@/components/ui/link";
import { Swatch } from "@/components/ui/swatch";
import { getColorSwatch } from "@/lib/product/color-swatches";
import type { OptionGroupState } from "@/lib/product/types";

interface ColorPickerProps extends ComponentProps<"div"> {
  hideImages?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

export function ColorPicker({
  hideImages,
  onSelectValue,
  option,
  className,
  ...props
}: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 gap-y-2", className)} {...props}>
      <span className="type-h4 w-full shrink-0 desktop:w-16">{option.name}</span>
      <div className="flex flex-wrap gap-2">
        {option.values.map((value) => {
          const color = value.swatch?.color ?? getColorSwatch(value.name);
          const imageUrl = hideImages
            ? undefined
            : value.swatch?.image || (color ? undefined : value.image);
          const swatch = (
            <Swatch color={color} image={imageUrl} label={value.name} selected={value.selected} />
          );
          if (!value.exists || (!value.available && !value.selected)) {
            return (
              <button
                key={value.name}
                aria-label={`${option.name}: ${value.name} (unavailable)`}
                className="block cursor-not-allowed"
                disabled
                type="button"
              >
                {swatch}
              </button>
            );
          }
          return (
            <Link
              key={value.name}
              href={value.href}
              scroll={false}
              className="focus-ring flex min-h-9 min-w-9 cursor-pointer items-center justify-center"
              aria-label={`Select ${option.name}: ${value.name}${value.available ? "" : " (sold out)"}`}
              aria-current={value.selected ? "true" : undefined}
              onClick={
                onSelectValue && !value.crossProduct
                  ? (event) => {
                      event.preventDefault();
                      onSelectValue(option.name, value.name);
                    }
                  : undefined
              }
            >
              {swatch}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
