"use client";

import { useCollection } from "@shopify/hydrogen/react";
import { LoaderCircleIcon } from "lucide-react";
import { type ReactNode, useEffect, useEffectEvent, useRef, useState } from "react";

import { ProductCard } from "@/components/product-card/product-card";
import { Button } from "@/components/ui/button";
import { getBrowseSearch } from "@/lib/collections";
import { loadMoreBrowseProductsAction } from "@/lib/collections/action";
import type { BrowseSource } from "@/lib/collections/types";
import type { PageInfo } from "@/lib/pagination/types";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

interface InfiniteProductGridProps {
  children: ReactNode;
  initialPageInfo: PageInfo;
  initialProductIds: string[];
  source: BrowseSource;
}

export function InfiniteProductGrid({
  children,
  initialPageInfo,
  initialProductIds,
  source,
}: InfiniteProductGridProps) {
  // The store, not a server snapshot, is the single source of truth for filters and sort mid-scroll.
  const search = useCollection(getBrowseSearch);
  const isPending = useCollection((state) => state.status === "loading");
  const [additionalProducts, setAdditionalProducts] = useState<ProductCardType[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const loadMorePage = useEffectEvent(async () => {
    // This grid's cursor belongs to the settled browse state; the next state remounts the grid.
    if (isPending || loadingRef.current || !pageInfo.hasNextPage || !pageInfo.endCursor) return;
    loadingRef.current = true;
    setIsLoading(true);
    setAnnouncement("Loading more products.");

    try {
      const result = await loadMoreBrowseProductsAction({
        cursor: pageInfo.endCursor,
        search,
        source,
      });
      // Live cursor pages can re-emit a boundary product if the ranking shifts mid-scroll; skip ids already shown.
      const seen = new Set([
        ...initialProductIds,
        ...additionalProducts.map((product) => product.id),
      ]);
      const newProducts = result.products.filter((product) => !seen.has(product.id));
      setAdditionalProducts((prev) => [...prev, ...newProducts]);
      setAnnouncement(
        `${newProducts.length} more ${newProducts.length === 1 ? "product" : "products"} loaded.`,
      );
      setPageInfo(result.pageInfo);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  });

  // Re-arm the observer per cursor so a sentinel still in view after a page lands triggers the next load.
  const { endCursor, hasNextPage } = pageInfo;
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || !endCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMorePage();
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [endCursor, hasNextPage]);
  return (
    <div
      aria-busy={isLoading || undefined}
      className="transition-opacity duration-(--motion-fast) data-[pending=true]:pointer-events-none data-[pending=true]:opacity-50"
      data-pending={isPending}
    >
      <h2 className="sr-only">Products</h2>
      <div className="grid grid-cols-2 gap-x-(--grid-gap) gap-y-(--grid-row-gap) tablet:grid-cols-3 desktop:grid-cols-4">
        {children}
        {additionalProducts.map((product) => (
          <ProductCard key={product.id} product={product} outOfStockText="Out of stock" />
        ))}
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>

      {pageInfo.hasNextPage && (
        <div className="flex flex-col items-center gap-3 py-10">
          {isLoading ? (
            <div className="flex items-center gap-2" role="status">
              <LoaderCircleIcon className="size-4 animate-spin text-ink-muted motion-reduce:animate-none" />
              <span className="type-label text-ink-muted">Loading more products</span>
            </div>
          ) : (
            <Button onClick={() => void loadMorePage()} size="sm" type="button" variant="outline">
              Load more
            </Button>
          )}
          <div aria-hidden="true" className="h-px w-full" ref={sentinelRef} />
        </div>
      )}
    </div>
  );
}
