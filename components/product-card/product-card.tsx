import { cn } from "cn";
import Image from "next/image";

import { BrowseProductMedia } from "@/components/product-card/browse-media";
import { QuickShop } from "@/components/product-card/quick-shop";
import { WishlistButton } from "@/components/product-card/wishlist-button";
import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { buildProductUrl } from "@/lib/product";
import { getColorSwatch } from "@/lib/product/color-swatches";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

export interface ProductCardProps {
  captionLayout?: "compact" | "row" | "stack";
  className?: string;
  loading?: "eager" | "lazy";
  mediaAspect?: "2/3" | "5/9";
  outOfStockText?: string;
  product: ProductCardType;
  showActions?: boolean;
  showPrice?: boolean;
  showSwatches?: boolean;
  variant?: "browse" | "cart" | "default";
}

export const PRODUCT_TITLE_MARK_CLASS =
  "underline decoration-1 decoration-transparent underline-offset-4 transition-colors duration-(--motion-underline) ease-(--ease-standard) group-focus-within/card:decoration-current group-hover/card:decoration-current focus-visible:decoration-current motion-reduce:transition-none";

export const PRODUCT_TITLE_LINK_CLASS = `focus-ring ${PRODUCT_TITLE_MARK_CLASS}`;

function swatchStyle(swatch: { color?: string; image?: string } | undefined) {
  if (!swatch) return undefined;
  return {
    ...(swatch.color ? { backgroundColor: swatch.color } : {}),
    ...(swatch.image ? { backgroundImage: `url(${swatch.image})`, backgroundSize: "cover" } : {}),
  };
}

function cardSwatch(value: { name: string; swatch?: { color?: string; image?: string } }) {
  const color = value.swatch?.color ?? getColorSwatch(value.name);
  return color || value.swatch?.image
    ? { ...value.swatch, ...(color ? { color } : {}) }
    : undefined;
}

export function ProductCard({
  captionLayout = "stack",
  className,
  loading = "lazy",
  mediaAspect = "2/3",
  outOfStockText = "Out of stock",
  product,
  showActions = true,
  showPrice = true,
  showSwatches = true,
  variant = "default",
}: ProductCardProps) {
  const isBrowse = variant === "browse";
  const isCart = variant === "cart";
  const href = buildProductUrl(product.handle, product.defaultVariantSelectedOptions ?? []);
  const colorOption = product.options?.find((option) =>
    option.values.some((value) => cardSwatch(value)),
  );
  const colorValues = colorOption?.values.filter((value) => cardSwatch(value)).slice(0, 4) ?? [];
  const sizeOption = product.options?.find((option) => option.name.toLowerCase().includes("size"));
  const sizes = sizeOption?.values.map((value) => value.name).slice(0, 6) ?? [];

  return (
    <article
      className={cn("group/card relative flex h-full flex-col", className)}
      data-slot="product-card"
    >
      <div
        className={
          isCart
            ? "relative mx-auto aspect-[2/3] w-full max-w-[250px] overflow-hidden border border-ink bg-surface desktop:aspect-[250/447] desktop:border-0"
            : isBrowse
              ? "relative aspect-[3/4] overflow-hidden bg-paper desktop:aspect-[4/5] [[data-card-density=gallery]_&]:aspect-[2/3]"
              : cn(
                  "relative overflow-hidden bg-surface",
                  mediaAspect === "5/9" ? "aspect-[5/9]" : "aspect-[2/3]",
                )
        }
      >
        {isBrowse ? (
          <BrowseProductMedia
            featuredImage={product.featuredImage}
            hoverImage={product.hoverImage}
            href={href}
            loading={loading}
            sizes={sizes}
            title={product.title}
          />
        ) : (
          <Link aria-hidden="true" className="absolute inset-0 block" href={href} tabIndex={-1}>
            {product.featuredImage ? (
              <Image
                alt={product.featuredImage.altText || product.title}
                className="object-cover"
                fill
                loading={loading}
                sizes="100vw"
                src={product.featuredImage.url}
              />
            ) : (
              <ImagePlaceholder className="size-full" />
            )}
          </Link>
        )}

        {!product.availableForSale ? (
          <span className="type-label absolute inset-0 flex items-center justify-center bg-black/55 text-inverse">
            {outOfStockText}
          </span>
        ) : null}

        {showSwatches && !isBrowse && colorValues.length > 0 ? (
          <span className="absolute top-3.5 right-3.5 flex gap-2">
            {colorValues.map((value) => (
              <span
                className="size-2.5 ring-1 ring-ink/10"
                key={value.name}
                style={swatchStyle(cardSwatch(value))}
              >
                <span className="sr-only">{value.name}</span>
              </span>
            ))}
          </span>
        ) : null}

        {showActions && !isBrowse ? (
          <>
            <WishlistButton product={product} />
            <QuickShop
              handle={product.handle}
              href={href}
              image={product.featuredImage?.url ?? null}
              label="Quick shop"
              title={product.title}
            />
          </>
        ) : null}
      </div>

      {isCart ? (
        <div className="flex h-12 items-center justify-between gap-2 px-2 desktop:h-auto desktop:flex-col desktop:items-start desktop:gap-2 desktop:px-6 desktop:pt-6">
          <h3 className="type-meta-semibold min-w-0 truncate text-ink desktop:type-h4">
            <Link
              className={cn(
                PRODUCT_TITLE_LINK_CLASS,
                "-my-2.5 flex min-h-9 items-center desktop:my-0 desktop:min-h-0",
              )}
              href={href}
            >
              {product.title}
            </Link>
          </h3>
          {showPrice ? (
            <Price
              amount={product.price.amount}
              className="type-eyebrow shrink-0 text-ink desktop:type-h4"
              currencyCode={product.price.currencyCode}
            />
          ) : null}
        </div>
      ) : isBrowse ? (
        <div className="grid gap-1 px-6 pt-2 desktop:pt-6">
          <h3 className="type-caption min-w-0 truncate text-ink">
            <Link
              className={cn(PRODUCT_TITLE_LINK_CLASS, "inline-flex min-h-9 items-center")}
              href={href}
            >
              {product.title}
            </Link>
          </h3>
          {showPrice ? (
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              {product.maxPrice.amount !== product.price.amount ? (
                <span className="type-body-sm text-ink-muted">From</span>
              ) : null}
              <Price
                amount={product.price.amount}
                className="type-body-sm text-ink"
                currencyCode={product.price.currencyCode}
              />
              {product.compareAtPrice &&
              Number(product.compareAtPrice.amount) > Number(product.price.amount) ? (
                <Price
                  amount={product.compareAtPrice.amount}
                  className="type-body-sm text-ink-muted line-through"
                  currencyCode={product.compareAtPrice.currencyCode}
                />
              ) : null}
            </div>
          ) : null}
          {sizes.length > 0 ? (
            <p className="type-label hidden truncate text-ink-muted pointer-coarse:block">
              Sizes {sizes.join(" ")}
            </p>
          ) : null}
        </div>
      ) : captionLayout === "compact" ? (
        <div className="grid gap-1 px-3 pt-3 desktop:px-6 desktop:pt-6">
          <h3 className="type-caption min-w-0 truncate text-ink">
            <Link
              className={cn(PRODUCT_TITLE_LINK_CLASS, "inline-flex min-h-9 items-center")}
              href={href}
            >
              {product.title}
            </Link>
          </h3>
          {showPrice ? (
            <Price
              amount={product.price.amount}
              className="type-label text-ink"
              currencyCode={product.price.currencyCode}
            />
          ) : null}
        </div>
      ) : captionLayout === "row" ? (
        <div className="flex items-center justify-between gap-3 px-6 py-1.5">
          <h3 className="type-caption min-w-0 truncate text-ink">
            <Link
              className={cn(PRODUCT_TITLE_LINK_CLASS, "inline-flex min-h-9 items-center")}
              href={href}
            >
              {product.title}
            </Link>
          </h3>
          {showPrice ? (
            <Price
              amount={product.price.amount}
              className="type-caption shrink-0 text-ink-muted"
              currencyCode={product.price.currencyCode}
            />
          ) : null}
        </div>
      ) : (
        <div className="grid gap-1 px-2 pt-2 pb-2">
          <h3 className="type-caption min-w-0 truncate text-ink">
            <Link
              className={cn(PRODUCT_TITLE_LINK_CLASS, "inline-flex min-h-9 items-center")}
              href={href}
            >
              {product.title}
            </Link>
          </h3>
          {showPrice ? (
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              {product.maxPrice.amount !== product.price.amount ? (
                <span className="type-body-sm text-ink-muted">From</span>
              ) : null}
              <Price
                amount={product.price.amount}
                className="type-caption text-ink-muted"
                currencyCode={product.price.currencyCode}
              />
              {product.compareAtPrice &&
              Number(product.compareAtPrice.amount) > Number(product.price.amount) ? (
                <Price
                  amount={product.compareAtPrice.amount}
                  className="type-label text-ink-muted line-through"
                  currencyCode={product.compareAtPrice.currencyCode}
                />
              ) : null}
            </div>
          ) : null}
          {sizes.length > 0 ? (
            <p className="type-body-sm truncate text-ink-muted">{sizes.join(" ")}</p>
          ) : null}
        </div>
      )}
    </article>
  );
}

export function ProductCardSkeleton({
  className,
  mediaAspect = "2/3",
  variant = "default",
}: {
  className?: string;
  mediaAspect?: "2/3" | "5/9";
  variant?: "cart" | "default";
}) {
  if (variant === "cart") {
    return (
      <div className={cn("flex flex-col", className)}>
        <ImagePlaceholder className="mx-auto aspect-[2/3] w-full max-w-[250px] animate-pulse border border-ink motion-reduce:animate-none desktop:aspect-[250/447] desktop:border-0" />
        <div className="flex h-12 items-center justify-between gap-2 px-2 desktop:h-auto desktop:flex-col desktop:items-start desktop:gap-2 desktop:px-6 desktop:pt-6">
          <div className="h-3 w-2/3 animate-pulse bg-surface motion-reduce:animate-none" />
          <div className="h-2.5 w-10 animate-pulse bg-surface motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <ImagePlaceholder
        className={cn(
          "animate-pulse motion-reduce:animate-none",
          mediaAspect === "5/9" ? "aspect-[5/9]" : "aspect-[2/3]",
        )}
      />
      <div className="grid gap-2 px-2 py-2">
        <div className="h-3 w-full animate-pulse bg-surface motion-reduce:animate-none" />
        <div className="h-3 w-1/3 animate-pulse bg-surface motion-reduce:animate-none" />
      </div>
    </div>
  );
}
