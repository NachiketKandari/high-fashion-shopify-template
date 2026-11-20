import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import { getCollectionResults } from "@/lib/collections/server";

const ROW_CLASS =
  "scrollbar-hide flex snap-x snap-mandatory gap-0 overflow-x-auto desktop:grid desktop:grid-cols-4 desktop:overflow-visible";
const CARD_CLASS = "w-[180.75px] shrink-0 snap-start desktop:w-auto";

export function CartRecommendations() {
  return (
    <Suspense fallback={<CartRecommendationsSkeleton />}>
      <CartRecommendationsContent />
    </Suspense>
  );
}

async function CartRecommendationsContent() {
  const { products } = await getCollectionResults({ handle: "new-in" });
  if (products.length === 0) return null;
  return (
    <div className={ROW_CLASS}>
      {products.slice(0, 4).map((product, index) => (
        <ProductCard
          captionLayout="row"
          className={CARD_CLASS}
          key={product.id}
          loading={index === 0 ? "eager" : "lazy"}
          product={product}
          showActions={false}
          showSwatches={false}
          variant="cart"
        />
      ))}
    </div>
  );
}

function CartRecommendationsSkeleton() {
  return (
    <div className={ROW_CLASS}>
      {Array.from({ length: 4 }, (_, index) => (
        <ProductCardSkeleton className={CARD_CLASS} key={index} variant="cart" />
      ))}
    </div>
  );
}
