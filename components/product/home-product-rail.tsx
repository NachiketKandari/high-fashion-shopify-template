import { Suspense } from "react";

import { ProductCard } from "@/components/product-card/product-card";
import { ProductRail } from "@/components/product/product-rail";
import { getCollectionResults } from "@/lib/collections/server";

const CARD_CLASS = "w-[226px] shrink-0 md:w-[266px]";

export function HomeProductRail() {
  return (
    <Suspense fallback={<HomeProductRailSkeleton />}>
      <HomeProductRailContent />
    </Suspense>
  );
}

async function HomeProductRailContent() {
  const { products } = await getCollectionResults({ handle: "bestsellers" });
  if (products.length === 0) return null;
  return (
    <ProductRail href="/collections/bestsellers" title="Our Picks">
      {products.slice(0, 8).map((product) => (
        <ProductCard className={CARD_CLASS} key={product.id} product={product} />
      ))}
    </ProductRail>
  );
}

function HomeProductRailSkeleton() {
  return (
    <ProductRail href="/collections/bestsellers" title="Our Picks">
      {Array.from({ length: 5 }, (_, index) => (
        <div className={CARD_CLASS} key={index}>
          <div className="aspect-[2/3] animate-pulse bg-surface" />
          <div className="mt-2.5 h-3 w-2/3 animate-pulse bg-surface" />
        </div>
      ))}
    </ProductRail>
  );
}
