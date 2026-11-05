import { cn } from "cn";
import type { ComponentProps } from "react";

import { DiscountBadge } from "@/components/product/discount-badge";
import { Price } from "@/components/product/price";
import { getDiscountPercent, isMarkedDown } from "@/lib/product";

interface ProductPriceProps extends ComponentProps<"div"> {
  amount: string;
  currencyCode: string;
  compareAtAmount?: string;
}

export function ProductPrice({
  amount,
  currencyCode,
  compareAtAmount,
  className,
  ...props
}: ProductPriceProps) {
  const markedDown = isMarkedDown(amount, compareAtAmount);
  const discountPercent = getDiscountPercent(amount, compareAtAmount);
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)} {...props}>
      <Price
        amount={amount}
        currencyCode={currencyCode}
        className="type-display font-normal text-ink"
      />
      {markedDown && (
        <Price
          amount={compareAtAmount}
          currencyCode={currencyCode}
          className="type-display font-normal text-ink/35 line-through"
        />
      )}
      {discountPercent !== null ? <DiscountBadge percent={discountPercent} /> : null}
    </div>
  );
}
