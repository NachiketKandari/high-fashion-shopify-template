import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import type { ProductCard as ProductCardType } from "@/lib/product/types";

const ROW_CLASS =
  "scrollbar-hide flex snap-x snap-mandatory gap-0 overflow-x-auto desktop:grid desktop:grid-cols-4 desktop:overflow-visible";

function RelatedProductsSectionSkeleton({ limit }: { limit: number }) {
  return (
    <div className="grid gap-2.5 py-10 desktop:gap-5 desktop:py-20">
      <h2 className="type-meta-semibold px-(--gutter) text-ink">you may also like</h2>
      <div className={ROW_CLASS}>
        {Array.from({ length: limit }, (_, index) => (
          <ProductCardSkeleton
            className="w-[180.75px] shrink-0 desktop:w-auto desktop:[&>div:first-child]:mx-auto desktop:[&>div:first-child]:h-[447px] desktop:[&>div:first-child]:w-[250px]"
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
      <h2 className="type-meta-semibold px-(--gutter) text-ink">you may also like</h2>
      <div className={ROW_CLASS}>
        {related.slice(0, limit).map((product) => (
          <ProductCard
            captionLayout="row"
            className="w-[180.75px] shrink-0 snap-start desktop:w-auto desktop:[&>div:first-child]:mx-auto desktop:[&>div:first-child]:h-[447px] desktop:[&>div:first-child]:w-[250px] desktop:[&>div:last-child]:mt-6 desktop:[&>div:last-child]:flex-col desktop:[&>div:last-child]:items-start desktop:[&>div:last-child]:gap-2 desktop:[&>div:last-child]:py-0 desktop:[&>div:last-child_h3_a]:-my-[9px] [&>div:first-child]:aspect-[2/3]"
            key={product.id}
            outOfStockText="Out of stock"
            product={product}
            showActions={false}
            showSwatches={false}
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
