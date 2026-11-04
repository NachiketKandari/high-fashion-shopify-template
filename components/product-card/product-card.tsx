import { cn } from "cn";
import Image from "next/image";

import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { buildProductUrl } from "@/lib/product";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

import { WishlistButton } from "./wishlist-button";

export interface ProductCardProps {
  className?: string;
  loading?: "eager" | "lazy";
  outOfStockText?: string;
  product: ProductCardType;
  quickShopText?: string;
  showSizes?: boolean;
}

function formatSwatchValue(swatch: { color?: string; image?: string } | undefined) {
  if (swatch?.color) return swatch.color;
  return undefined;
}

export function ProductCard({
  className,
  loading = "lazy",
  outOfStockText = "Out of stock",
  product,
  showSizes = true,
}: ProductCardProps) {
  const href = buildProductUrl(product.handle, product.defaultVariantSelectedOptions ?? []);
  const colorOption = product.options?.find((option) =>
    option.values.some((value) => value.swatch?.color || value.swatch?.image),
  );
  const colorValues = colorOption?.values.filter((value) => value.swatch).slice(0, 4) ?? [];
  const sizeOption = product.options?.find((option) => option.name.toLowerCase().includes("size"));
  const sizes = sizeOption?.values.map((value) => value.name).slice(0, 6) ?? [];

  return (
    <article className={cn("group/card relative flex h-full flex-col", className)}>
      <Link
        aria-label={product.title}
        className="relative block aspect-[2/3] overflow-hidden bg-surface"
        href={href}
      >
        {product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText || product.title}
            className="object-cover transition-transform duration-600 ease-[cubic-bezier(.2,.6,.2,1)] group-hover/card:scale-[1.03]"
            fill
            loading={loading}
            sizes="100vw"
            src={product.featuredImage.url}
          />
        ) : (
          <ImagePlaceholder className="size-full" />
        )}
        {product.hoverImage ? (
          <Image
            alt=""
            aria-hidden="true"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
            fill
            loading="lazy"
            sizes="100vw"
            src={product.hoverImage.url}
          />
        ) : null}
        {!product.availableForSale ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xs uppercase tracking-wider text-white">
            {outOfStockText}
          </span>
        ) : null}
        {colorValues.length > 0 ? (
          <span className="absolute right-3 top-3 flex gap-2">
            {colorValues.map((value) => (
              <span
                className="size-3.5 ring-1 ring-black/10"
                key={value.name}
                style={{ backgroundColor: formatSwatchValue(value.swatch) }}
                title={value.name}
              />
            ))}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 items-end justify-between gap-2 px-2 pb-1.5 pt-2">
        <div className="grid min-w-0 flex-1 gap-1">
          <div className="flex w-full min-w-0 flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-2">
            <h3 className="min-w-0 flex-1 truncate text-13 uppercase leading-[17px] text-foreground">
              <Link href={href}>{product.title}</Link>
            </h3>
            <Price
              amount={product.price.amount}
              className="shrink-0 text-[13px] leading-[17px] text-foreground"
              currencyCode={product.price.currencyCode}
            />
          </div>
          {showSizes && sizes.length > 0 ? (
            <p className="truncate text-xs leading-4 text-muted-foreground">{sizes.join(" ")}</p>
          ) : null}
        </div>
        <WishlistButton product={product} />
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <ImagePlaceholder className="aspect-[2/3] animate-pulse" />
      <div className="grid gap-2 py-2.5">
        <div className="h-3 w-full animate-pulse bg-surface" />
        <div className="h-3 w-1/3 animate-pulse bg-surface" />
      </div>
    </div>
  );
}
