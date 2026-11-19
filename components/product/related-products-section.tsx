import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

const ROW_CLASS =
  "scrollbar-hide flex snap-x snap-mandatory gap-0 overflow-x-auto desktop:grid desktop:grid-cols-4 desktop:overflow-visible";

function RelatedProductsSectionSkeleton({ limit }: { limit: number }) {
  return (
    <div className="grid gap-2.5 py-10 desktop:gap-5 desktop:py-20">
      <h2 className="type-control px-(--gutter) text-ink">you may also like</h2>
      <div className={ROW_CLASS}>
        {Array.from({ length: limit }, (_, index) => (
          <ProductCardSkeleton
            className="w-[180.75px] shrink-0 desktop:w-auto desktop:[&>div:first-child]:mx-auto desktop:[&>div:first-child]:w-[250px]"
            key={index}
          />
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
    <div className="grid gap-2.5 py-10 desktop:gap-5 desktop:py-20">
      <h2 className="type-control px-(--gutter) text-ink">you may also like</h2>
      <div className={ROW_CLASS}>
        {related.slice(0, limit).map((product) => (
          <ProductCard
            captionLayout="row"
            className="w-[180.75px] shrink-0 snap-start desktop:w-auto desktop:[&>div:first-child]:mx-auto desktop:[&>div:first-child]:w-[250px]"
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
