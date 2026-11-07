import { cn } from "cn";
import type { ComponentProps } from "react";

import { isColorOption } from "@/lib/product";
import type { OptionGroupState } from "@/lib/product/types";

import { ColorPicker } from "./color-picker";
import { OptionPicker } from "./option-picker";

interface ProductInfoOptionsProps extends ComponentProps<"div"> {
  compact?: boolean;
  hideImages?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  options: OptionGroupState[];
  sizeGuideCategory?: string;
}

function ProductInfoOptions({
  compact = false,
  hideImages,
  onSelectValue,
  options,
  sizeGuideCategory,
  className,
  ...props
}: ProductInfoOptionsProps) {
  // Shopify emits a synthetic Title/Default Title option for products with no variant axes — hide it.
  const isShopifyDefaultOption = (opt: OptionGroupState) =>
    opt.name === "Title" && opt.values.length === 1 && opt.values[0]?.name === "Default Title";
  const isSingleValueOption = (opt: OptionGroupState) => opt.values.length === 1;
  const renderable = options.filter((opt) => !isShopifyDefaultOption(opt));
  if (renderable.length === 0) return null;

  const singleValueOptions = renderable.filter(isSingleValueOption);
  const colorOptions = renderable.filter((opt) => !isSingleValueOption(opt) && isColorOption(opt));
  const otherOptions = renderable.filter((opt) => !isSingleValueOption(opt) && !isColorOption(opt));
  return (
    <div data-slot="product-info-options" className={className} {...props}>
      <div className={cn("grid", compact ? "gap-2.5" : "gap-5")}>
        {singleValueOptions.map((option) => (
          <p key={option.name} className="type-h4 text-ink-muted">
            {option.name}: <span className="text-foreground">{option.values[0]?.name}</span>
          </p>
        ))}

        {colorOptions.map((option) => (
          <ColorPicker
            key={option.name}
            hideImages={hideImages}
            onSelectValue={onSelectValue}
            option={option}
          />
        ))}

        {otherOptions.map((option) => (
          <OptionPicker
            compact={compact}
            key={option.name}
            onSelectValue={onSelectValue}
            option={option}
            sizeGuideCategory={sizeGuideCategory}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductInfoDescriptionProps extends ComponentProps<"div"> {
  descriptionHtml: string;
}

function ProductInfoDescription({
  descriptionHtml,
  className,
  ...props
}: ProductInfoDescriptionProps) {
  if (!descriptionHtml) return null;
  return (
    <div data-slot="product-info-description" className={className} {...props}>
      <div
        className="type-body-sm text-ink-muted [&_li]:m-0 [&_p]:m-0 [&_ul]:m-0 [&_ul]:grid [&_ul]:gap-0.5"
        // oxlint-disable-next-line react/no-danger -- Product descriptions pass through sanitizeShopifyHtml when fetched.
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    </div>
  );
}

export { ProductInfoDescription, ProductInfoOptions };
