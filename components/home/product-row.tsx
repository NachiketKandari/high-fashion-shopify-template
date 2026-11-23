import { cn } from "cn";
import Image from "next/image";
import { Suspense } from "react";

import {
  PRODUCT_TITLE_LINK_CLASS,
  PRODUCT_TITLE_MARK_CLASS,
  ProductCard,
  ProductCardSkeleton,
} from "@/components/product-card/product-card";
import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { getCollectionResults } from "@/lib/collections/server";
import { buildProductUrl } from "@/lib/product";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

const DEFAULT_ROW_CLASS =
  "flex snap-x gap-x-(--grid-gap) overflow-x-auto desktop:grid desktop:grid-cols-4 desktop:gap-x-0 desktop:overflow-visible";
const DEFAULT_CARD_CLASS = "w-[46.4vw] shrink-0 snap-start desktop:w-auto";

const HOME_ROW_CLASS =
  "grid grid-cols-2 gap-x-3 gap-y-10 px-(--gutter) pt-12 pb-10 tablet:grid-cols-4 tablet:gap-x-6 desktop:gap-x-[102px] desktop:gap-y-0 desktop:px-20 desktop:py-20";
const HOME_CARD_CLASS = "w-auto";

interface ProductRowProps {
  handle: string;
  limit?: number;
  variant?: "default" | "home";
}

export function ProductRow({ handle, limit = 4, variant = "default" }: ProductRowProps) {
  return (
    <Suspense fallback={<ProductRowSkeleton limit={limit} variant={variant} />}>
      <ProductRowContent handle={handle} limit={limit} variant={variant} />
    </Suspense>
  );
}

async function ProductRowContent({
  handle,
  limit,
  variant,
}: {
  handle: string;
  limit: number;
  variant: NonNullable<ProductRowProps["variant"]>;
}) {
  const { products } = await getCollectionResults({ handle });
  if (products.length === 0) return null;

  if (variant === "home") {
    return (
      <div className={HOME_ROW_CLASS}>
        {products.slice(0, limit).map((product, index) => (
          <HomeProductCard
            key={product.id}
            loading={index === 0 ? "eager" : "lazy"}
            product={product}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={DEFAULT_ROW_CLASS}>
      {products.slice(0, limit).map((product, index) => (
        <ProductCard
          captionLayout="row"
          className={DEFAULT_CARD_CLASS}
          key={product.id}
          loading={index === 0 ? "eager" : "lazy"}
          product={product}
        />
      ))}
    </div>
  );
}

function HomeProductCard({
  loading,
  product,
}: {
  loading: "eager" | "lazy";
  product: ProductCardType;
}) {
  const href = buildProductUrl(product.handle, product.defaultVariantSelectedOptions ?? []);

  return (
    <article className={cn(HOME_CARD_CLASS, "group/card flex h-full flex-col")}>
      <Link
        aria-hidden="true"
        className="relative block aspect-[2/3] overflow-hidden bg-surface desktop:aspect-[5/9]"
        href={href}
        tabIndex={-1}
      >
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
      <div className="hidden justify-center pt-6 desktop:flex">
        <h3 className="type-body min-w-0 text-center text-ink">
          <Link
            className={cn(PRODUCT_TITLE_LINK_CLASS, "inline-flex min-h-9 items-center")}
            href={href}
          >
            {product.title}
          </Link>
        </h3>
      </div>
      <div className="desktop:hidden">
        <Link className="focus-ring grid gap-1 px-1 pt-3" href={href}>
          <span className={cn(PRODUCT_TITLE_MARK_CLASS, "type-label min-w-0 text-ink")}>
            {product.title}
          </span>
          <Price
            amount={product.price.amount}
            className="type-label text-ink-muted"
            currencyCode={product.price.currencyCode}
          />
        </Link>
      </div>
    </article>
  );
}

function ProductRowSkeleton({
  limit,
  variant,
}: {
  limit: number;
  variant: NonNullable<ProductRowProps["variant"]>;
}) {
  const rowClass = variant === "home" ? HOME_ROW_CLASS : DEFAULT_ROW_CLASS;
  const cardClass = variant === "home" ? HOME_CARD_CLASS : DEFAULT_CARD_CLASS;

  return (
    <div className={rowClass}>
      {Array.from({ length: limit }, (_, index) => (
        <ProductRowCardSkeleton
          className={cardClass}
          key={index}
          variant={variant === "home" ? "home" : "default"}
        />
      ))}
    </div>
  );
}

function ProductRowCardSkeleton({
  className,
  variant,
}: {
  className?: string;
  variant: "default" | "home";
}) {
  if (variant === "default") {
    return <ProductCardSkeleton className={className} />;
  }

  return (
    <div className={cn(className, "flex flex-col")}>
      <ImagePlaceholder className="aspect-[2/3] animate-pulse motion-reduce:animate-none desktop:aspect-[5/9]" />
      <div className="hidden justify-center pt-6 desktop:flex">
        <div className="h-[21px] w-3/4 animate-pulse bg-surface motion-reduce:animate-none" />
      </div>
      <div className="grid gap-1 px-1 pt-3 desktop:hidden">
        <div className="h-4 w-2/3 animate-pulse bg-surface motion-reduce:animate-none" />
        <div className="h-4 w-12 animate-pulse bg-surface motion-reduce:animate-none" />
      </div>
    </div>
  );
}
