import { cn } from "cn";
import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import { Link } from "@/components/ui/link";
import { getSearchIndexProducts } from "@/lib/product/server";

const GRID_CLASS =
  "grid grid-cols-2 gap-x-(--grid-gap) gap-y-(--grid-row-gap) tablet:grid-cols-3 desktop:grid-cols-4";

interface ProductsGridSkeletonProps {
  count: number;
  className?: string;
}

export function ProductsGridSkeleton({ count, className }: ProductsGridSkeletonProps) {
  return (
    <div className={cn(GRID_CLASS, className)}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

interface ProductsGridProps {
  collectionUrl?: string;
  eagerCount?: number;
  limit: number;
  title: string;
}

export function ProductsGrid({ collectionUrl, eagerCount = 0, limit, title }: ProductsGridProps) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="type-h2">{title}</h2>
        {collectionUrl && (
          <Link className="type-control focus-ring flex h-9 items-center" href={collectionUrl}>
            View all
          </Link>
        )}
      </div>
      <Suspense fallback={<ProductsGridSkeleton count={limit} />}>
        <ProductsGridContent eagerCount={eagerCount} limit={limit} outOfStockText="Out of stock" />
      </Suspense>
    </div>
  );
}

async function ProductsGridContent({
  eagerCount,
  limit,
  outOfStockText,
}: {
  eagerCount: number;
  limit: number;
  outOfStockText: string;
}) {
  // Use the search index (not the products connection) so these match the first items on /collections/all.
  const { products } = await getSearchIndexProducts({
    limit,
  });
  if (products.length === 0) return null;
  return (
    <div className={GRID_CLASS}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          loading={index < eagerCount ? "eager" : "lazy"}
          product={product}
          outOfStockText={outOfStockText}
        />
      ))}
    </div>
  );
}
