import { cn } from "cn";
import Image from "next/image";

import { QuickShop } from "@/components/product-card/quick-shop";
import { WishlistButton } from "@/components/product-card/wishlist-button";
import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { buildProductUrl } from "@/lib/product";
import { getColorSwatch } from "@/lib/product/color-swatches";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

export interface ProductCardProps {
  className?: string;
  loading?: "eager" | "lazy";
  outOfStockText?: string;
  product: ProductCardType;
  showSizes?: boolean;
}

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
  className,
  loading = "lazy",
  outOfStockText = "Out of stock",
  product,
  showSizes = true,
}: ProductCardProps) {
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
      <div className="relative aspect-[2/3] overflow-hidden bg-surface">
        <Link aria-hidden="true" className="absolute inset-0 block" href={href} tabIndex={-1}>
          {product.featuredImage ? (
            <Image
              alt={product.featuredImage.altText || product.title}
              className="object-cover transition-transform duration-(--motion-image) ease-(--ease-standard) group-focus-within/card:scale-[1.03] group-hover/card:scale-[1.03] motion-reduce:transform-none"
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
              className="object-cover opacity-0 transition-opacity duration-(--motion-long) ease-(--ease-standard) group-focus-within/card:opacity-100 group-hover/card:opacity-100"
              fill
              loading="lazy"
              sizes="100vw"
              src={product.hoverImage.url}
            />
          ) : null}
        </Link>

        {!product.availableForSale ? (
          <span className="type-label absolute inset-0 flex items-center justify-center bg-black/55 text-inverse">
            {outOfStockText}
          </span>
        ) : null}

        {colorValues.length > 0 ? (
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

        <WishlistButton product={product} />
        <QuickShop
          handle={product.handle}
          href={href}
          image={product.featuredImage?.url ?? null}
          label="Quick shop"
          title={product.title}
        />
      </div>

      <div className="grid gap-1 px-2 pb-2 pt-2">
        <h3 className="type-h4 min-w-0 truncate text-ink">
          <Link className="focus-ring inline-flex min-h-9 items-center" href={href}>
            {product.title}
          </Link>
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          {product.maxPrice.amount !== product.price.amount ? (
            <span className="type-body-sm text-ink-muted">From</span>
          ) : null}
          <Price
            amount={product.price.amount}
            className="type-h4 font-light text-ink-muted normal-case"
            currencyCode={product.price.currencyCode}
          />
          {product.compareAtPrice &&
          Number(product.compareAtPrice.amount) > Number(product.price.amount) ? (
            <Price
              amount={product.compareAtPrice.amount}
              className="type-label font-light text-ink-muted line-through"
              currencyCode={product.compareAtPrice.currencyCode}
            />
          ) : null}
        </div>
        {showSizes && sizes.length > 0 ? (
          <p className="type-body-sm truncate text-ink-muted">{sizes.join(" ")}</p>
        ) : null}
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <ImagePlaceholder className="aspect-[2/3] animate-pulse motion-reduce:animate-none" />
      <div className="grid gap-2 px-2 py-2">
        <div className="h-3 w-full animate-pulse bg-surface motion-reduce:animate-none" />
        <div className="h-3 w-1/3 animate-pulse bg-surface motion-reduce:animate-none" />
      </div>
    </div>
  );
}
