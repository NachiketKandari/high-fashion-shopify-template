import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

const GRID_CLASS = "grid grid-cols-2 gap-x-(--grid-gap) gap-y-(--grid-row-gap) desktop:grid-cols-4";

function RelatedProductsSectionSkeleton({ limit }: { limit: number }) {
  return (
    <div className="grid gap-7">
      <h2 className="type-h2">You may also like</h2>
      <div className={GRID_CLASS}>
        {Array.from({ length: limit }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

async function Render({
  limit,
  productsPromise,
}: {
  limit: number;
  productsPromise: Promise<ProductCardType[]>;
}) {
  const related = await productsPromise;
  if (related.length === 0) return null;
  return (
    <div className="grid gap-7">
      <h2 className="type-h2">You may also like</h2>
      <div className={GRID_CLASS}>
        {related.slice(0, limit).map((product) => (
          <ProductCard key={product.id} product={product} outOfStockText="Out of stock" />
        ))}
      </div>
    </div>
  );
}

export function RelatedProductsSection({
  limit,
  productsPromise,
}: {
  limit: number;
  productsPromise: Promise<ProductCardType[]>;
}) {
  return (
    <Suspense fallback={<RelatedProductsSectionSkeleton limit={limit} />}>
      <Render limit={limit} productsPromise={productsPromise} />
    </Suspense>
  );
}
