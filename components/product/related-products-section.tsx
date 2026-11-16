import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

const ROW_CLASS = "grid grid-cols-2 gap-y-(--grid-row-gap) desktop:grid-cols-4 desktop:gap-y-0";

function RelatedProductsSectionSkeleton({ limit }: { limit: number }) {
  return (
    <div className="grid gap-5 pt-6">
      <h2 className="type-h4 px-(--gutter) text-ink">You may also like</h2>
      <div className={ROW_CLASS}>
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
    <div className="grid gap-5 pt-6">
      <h2 className="type-h4 px-(--gutter) text-ink">You may also like</h2>
      <div className={ROW_CLASS}>
        {related.slice(0, limit).map((product) => (
          <ProductCard
            captionLayout="row"
            key={product.id}
            outOfStockText="Out of stock"
            product={product}
          />
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
