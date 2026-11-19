import { cn } from "cn";
import Image from "next/image";
import type { ComponentProps } from "react";

import { Link } from "@/components/ui/link";
import { getColorSwatch } from "@/lib/product/color-swatches";
import type { OptionGroupState } from "@/lib/product/types";

interface ColorPickerProps extends ComponentProps<"div"> {
  hideImages?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

function SwatchVisual({
  color,
  image,
  label,
  selected,
}: {
  color?: string;
  image?: string;
  label: string;
  selected: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block size-4 overflow-hidden border transition-colors",
        selected ? "border-ink ring-1 ring-ink ring-offset-1 ring-offset-paper" : "border-ink/20",
      )}
      title={label}
    >
      {image ? (
        <Image
          alt=""
          className="size-full object-cover"
          height={64}
          sizes="100vw"
          src={image}
          width={64}
        />
      ) : (
        <span
          className="block size-full bg-surface"
          style={color ? { backgroundColor: color } : undefined}
        />
      )}
    </span>
  );
}

export function ColorPicker({
  hideImages,
  onSelectValue,
  option,
  className,
  ...props
}: ColorPickerProps) {
  return (
    <div className={cn("grid gap-3", className)} {...props}>
      <span className="type-control text-ink-strong">{option.name}</span>
      <div className="flex flex-wrap gap-2">
        {option.values.map((value) => {
          const color = value.swatch?.color ?? getColorSwatch(value.name);
          const imageUrl = hideImages
            ? undefined
            : value.swatch?.image || (color ? undefined : value.image);
          const swatch = (
            <SwatchVisual
              color={color}
              image={imageUrl}
              label={value.name}
              selected={value.selected}
            />
          );
          if (!value.exists || (!value.available && !value.selected)) {
            return (
              <button
                key={value.name}
                aria-label={`${option.name}: ${value.name} (unavailable)`}
                className="flex size-9 cursor-not-allowed items-center justify-center opacity-40 -my-2.5"
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
              className="focus-ring -my-2.5 flex size-9 cursor-pointer items-center justify-center"
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
