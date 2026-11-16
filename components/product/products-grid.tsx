import { cn } from "cn";

import { ProductCardSkeleton } from "@/components/product-card/product-card";

const GRID_CLASS =
  "-mx-(--gutter) grid grid-cols-2 gap-px tablet:mx-0 tablet:grid-cols-3 tablet:gap-x-(--grid-gap) tablet:gap-y-(--grid-row-gap) desktop:grid-cols-4";

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
