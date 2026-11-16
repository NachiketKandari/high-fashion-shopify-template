import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import { getCollectionResults } from "@/lib/collections/server";

const GRID_CLASS = "grid grid-cols-2 gap-x-(--grid-gap) gap-y-(--grid-row-gap) desktop:grid-cols-4";

interface ProductRowProps {
  handle: string;
  limit?: number;
}

export function ProductRow({ handle, limit = 4 }: ProductRowProps) {
  return (
    <Suspense fallback={<ProductRowSkeleton limit={limit} />}>
      <ProductRowContent handle={handle} limit={limit} />
    </Suspense>
  );
}

async function ProductRowContent({ handle, limit }: { handle: string; limit: number }) {
  const { products } = await getCollectionResults({ handle });
  if (products.length === 0) return null;
  return (
    <div className={GRID_CLASS}>
      {products.slice(0, limit).map((product, index) => (
        <ProductCard key={product.id} loading={index === 0 ? "eager" : "lazy"} product={product} />
      ))}
    </div>
  );
}

function ProductRowSkeleton({ limit }: { limit: number }) {
  return (
    <div className={GRID_CLASS}>
      {Array.from({ length: limit }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
