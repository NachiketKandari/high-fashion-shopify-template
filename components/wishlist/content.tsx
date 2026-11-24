"use client";

import Image from "next/image";
import { type RefObject, useEffect, useRef } from "react";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistQuickAdd } from "@/components/wishlist/quick-add";
import { buildProductUrl } from "@/lib/product";
import { getWishlistColorLabel } from "@/lib/wishlist";
import { refreshWishlistProductsAction } from "@/lib/wishlist/action";
import { mergeWishlistProducts, removeWishlist, useWishlistItems } from "@/lib/wishlist/client";
import type { WishlistItem } from "@/lib/wishlist/types";

interface WishlistCardProps {
  index: number;
  item: WishlistItem;
}

function WishlistCard({ index, item }: WishlistCardProps) {
  const { product } = item;
  const href = buildProductUrl(product.handle, item.selectedOptions);
  const color = getWishlistColorLabel(item.selectedOptions);

  return (
    <article className="flex h-full flex-col gap-3">
      <Link
        aria-hidden="true"
        className="focus-ring relative block aspect-[4/5] overflow-hidden border border-ink bg-surface"
        href={href}
        tabIndex={-1}
      >
        {product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText || product.title}
            className="object-cover"
            fill
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
            src={product.featuredImage.url}
          />
        ) : (
          <ImagePlaceholder className="size-full" />
        )}
      </Link>

      <div className="grid gap-3">
        <h2 className="type-meta-medium">
          <Link className="focus-ring inline-flex min-h-9 items-center" href={href}>
            {product.title}
          </Link>
        </h2>
        {color ? <p className="type-body-sm text-ink-muted">{color}</p> : null}
        <Price
          amount={product.price.amount}
          className="type-body-sm"
          currencyCode={product.price.currencyCode}
        />
        <p className="type-body-sm text-ink-muted">
          {product.availableForSale ? "In stock" : "Out of stock"}
        </p>
      </div>

      <div className="mt-auto grid gap-3">
        <WishlistQuickAdd item={item} />

        <button
          aria-label={`Remove ${product.title} from wishlist`}
          className="type-body-sm focus-ring inline-flex min-h-9 w-fit cursor-pointer items-center text-ink underline-offset-4 hover:underline"
          data-wishlist-remove
          onClick={() => {
            removeWishlist(product.id);
            requestAnimationFrame(() => {
              const buttons =
                document.querySelectorAll<HTMLButtonElement>("[data-wishlist-remove]");
              if (buttons.length > 0) buttons[Math.min(index, buttons.length - 1)]?.focus();
            });
          }}
          type="button"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

function WishlistEmpty({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 border border-ink p-6">
        <div className="grid gap-6">
          <h2 className="type-h2 focus-ring" ref={headingRef} tabIndex={-1}>
            A place for your future favourites
          </h2>
          <p className="type-body-sm text-ink">
            Save pieces from the collection to revisit them here.
          </p>
        </div>
        <Button className="w-full" render={<Link href="/collections/all" />}>
          Explore the Collection
        </Button>
      </div>
      <p className="type-body-sm text-ink-muted">Saved items don’t reserve stock.</p>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6" role="status">
      <span className="sr-only">Loading your wishlist</span>
      <Skeleton className="h-4 w-24" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-(--grid-row-gap) tablet:grid-cols-3 desktop:gap-x-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="flex h-full flex-col gap-3" key={index}>
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="grid gap-3">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <div className="mt-auto grid gap-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WishlistContent() {
  const items = useWishlistItems();
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousCount = useRef<number | null>(null);
  const idsKey = Array.from(new Set((items ?? []).map(({ product }) => product.id)))
    .sort()
    .join(",");

  useEffect(() => {
    if (!idsKey) return;
    const ids = idsKey.split(",");
    const batches = Array.from({ length: Math.ceil(ids.length / 50) }, (_, index) =>
      ids.slice(index * 50, index * 50 + 50),
    );
    let cancelled = false;
    void Promise.all(batches.map((batch) => refreshWishlistProductsAction(batch)))
      .then((results) => {
        if (cancelled) return;
        const products = results.flatMap((result) => result.products);
        if (results.every((result) => result.success)) {
          mergeWishlistProducts(products, { prune: true });
        } else if (products.length > 0) {
          mergeWishlistProducts(products);
        }
      })
      .catch(() => {
        // Keep the stored snapshot when the live refresh fails.
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  useEffect(() => {
    if (previousCount.current !== null && previousCount.current > 0 && items?.length === 0) {
      emptyHeadingRef.current?.focus();
    }
    previousCount.current = items?.length ?? null;
  }, [items]);

  if (items === null) return <WishlistSkeleton />;
  if (items.length === 0) return <WishlistEmpty headingRef={emptyHeadingRef} />;

  return (
    <div className="grid gap-6">
      <p aria-live="polite" className="type-body-sm text-ink">
        {items.length} saved {items.length === 1 ? "piece" : "pieces"}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-(--grid-row-gap) tablet:grid-cols-3 desktop:gap-x-6">
        {items.map((item, index) => (
          <WishlistCard index={index} item={item} key={item.product.id} />
        ))}
      </div>
      <p className="type-body-sm text-ink-muted">
        Select a size to move a piece to your bag. Price and stock are confirmed at checkout.
      </p>
    </div>
  );
}
