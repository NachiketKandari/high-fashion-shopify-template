import { cn } from "cn";

import { ProductCardSkeleton } from "@/components/product-card/product-card";

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
