import { cn } from "cn";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

import { DiscountBadge } from "@/components/product/discount-badge";
import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { getDiscountPercent } from "@/lib/product";

function ProductCard({ className, children, ...props }: ComponentProps<"article">) {
  return (
    <article
      data-slot="product-card"
      className={cn("relative flex flex-col h-full overflow-hidden", className)}
      {...props}
    >
      {children}
    </article>
  );
}

function ProductCardImageContainer({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-image-container"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface ProductCardImageProps {
  alt: string;
  children?: ReactNode;
  className?: string;
  height?: number;
  loading?: "eager" | "lazy";
  outOfStock?: boolean;
  outOfStockText?: string;
  src?: string | null;
  width?: number;
}

function ProductCardImage({
  alt,
  children,
  className,
  height,
  loading = "lazy",
  outOfStock = false,
  outOfStockText,
  src,
  width,
}: ProductCardImageProps) {
  return (
    <div
      data-slot="product-card-image"
      className={cn("relative aspect-square overflow-hidden", className)}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          {...(width && height ? { height, width } : { fill: true })}
          className="absolute inset-0 size-full object-cover"
          loading={loading}
          sizes="100vw"
        />
      ) : (
        <ImagePlaceholder className="size-full" />
      )}
      {outOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55">
          <span className="type-label px-2 py-1 text-inverse">{outOfStockText}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function ProductCardContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="product-card-content"
      className={cn("flex flex-1 flex-col gap-1 px-2 pb-2 pt-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ProductCardTitle({ className, children, ...props }: ComponentProps<"h3">) {
  return (
    <h3 data-slot="product-card-title" className={cn("type-h4 line-clamp-1", className)} {...props}>
      {children}
    </h3>
  );
}

interface ProductCardPriceProps {
  amount: string;
  currencyCode: string;
  maxAmount?: string;
  compareAtAmount?: string;
  compareAtCurrencyCode?: string;
  className?: string;
}

function ProductCardPrice({
  amount,
  currencyCode,
  maxAmount,
  compareAtAmount,
  compareAtCurrencyCode,
  className,
}: ProductCardPriceProps) {
  const isRange = maxAmount != null && maxAmount !== amount;
  // A range's per-variant discounts differ, so a single compare-at would be misleading.
  const discountPercent = isRange ? null : getDiscountPercent(amount, compareAtAmount);
  return (
    <div data-slot="product-card-price" className={cn(className)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="type-body-sm inline-flex items-baseline gap-x-1 text-ink-muted">
          <Price
            amount={amount}
            currencyCode={currencyCode}
            className="type-h4 font-light text-ink-muted"
          />
          {isRange && (
            <>
              <span>–</span>
              <Price
                amount={maxAmount}
                currencyCode={currencyCode}
                className="type-h4 font-light text-ink-muted"
              />
            </>
          )}
        </span>
        {discountPercent !== null && compareAtAmount && compareAtCurrencyCode ? (
          <>
            <Price
              amount={compareAtAmount}
              currencyCode={compareAtCurrencyCode}
              className="type-label text-ink-muted line-through"
            />
            <DiscountBadge percent={discountPercent} />
          </>
        ) : null}
      </div>
    </div>
  );
}

function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="product-card-skeleton"
      className={cn("flex flex-col overflow-hidden", className)}
    >
      <ImagePlaceholder className="aspect-square animate-pulse" />
      <div className="py-2.5 h-12 box-content grid gap-2">
        <div className="h-4 w-full bg-accent animate-pulse" />
        <div className="h-4 w-12 bg-accent animate-pulse" />
      </div>
    </div>
  );
}

export {
  ProductCard,
  ProductCardContent,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardPrice,
  ProductCardSkeleton,
  ProductCardTitle,
};
