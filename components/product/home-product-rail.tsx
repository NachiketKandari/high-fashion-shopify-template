import { Suspense } from "react";

import { ProductCard } from "@/components/product-card/product-card";
import { ProductRail } from "@/components/product/product-rail";
import { getSearchIndexProducts } from "@/lib/product/server";

const CARD_CLASS = "w-[226px] shrink-0 md:w-[266px]";

export function HomeProductRail() {
  return (
    <Suspense fallback={<HomeProductRailSkeleton />}>
      <HomeProductRailContent />
    </Suspense>
  );
}

async function HomeProductRailContent() {
  const { products } = await getSearchIndexProducts({ limit: 8 });
  if (products.length === 0) return null;
  return (
    <ProductRail href="/collections/all" title="Our Picks">
      {products.map((product) => (
        <ProductCard className={CARD_CLASS} key={product.id} product={product} showSizes={false} />
      ))}
    </ProductRail>
  );
}

function HomeProductRailSkeleton() {
  return (
    <ProductRail href="/collections/all" title="Our Picks">
      {Array.from({ length: 5 }, (_, index) => (
        <div className={CARD_CLASS} key={index}>
          <div className="aspect-[2/3] animate-pulse bg-surface" />
          <div className="mt-2.5 h-3 w-2/3 animate-pulse bg-surface" />
        </div>
      ))}
    </ProductRail>
  );
}
