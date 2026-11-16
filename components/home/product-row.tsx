import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import { getCollectionResults } from "@/lib/collections/server";

const ROW_CLASS =
  "flex snap-x gap-x-(--grid-gap) overflow-x-auto desktop:grid desktop:grid-cols-4 desktop:gap-x-0 desktop:overflow-visible";
const CARD_CLASS = "w-[46.4vw] shrink-0 snap-start desktop:w-auto";

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
    <div className={ROW_CLASS}>
      {products.slice(0, limit).map((product, index) => (
        <ProductCard
          captionLayout="row"
          className={CARD_CLASS}
          key={product.id}
          loading={index === 0 ? "eager" : "lazy"}
          product={product}
        />
      ))}
    </div>
  );
}

function ProductRowSkeleton({ limit }: { limit: number }) {
  return (
    <div className={ROW_CLASS}>
      {Array.from({ length: limit }, (_, index) => (
        <ProductCardSkeleton className={CARD_CLASS} key={index} />
      ))}
    </div>
  );
}
